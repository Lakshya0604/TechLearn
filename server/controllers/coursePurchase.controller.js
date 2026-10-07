import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import stripe from "../utils/stripe.js";

export const checkOutSession = async (req, res) => {
    try {
        const userId = req.id;
        const { courseId } = req.body;

        // Validate inputs
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }

        console.log("Creating checkout session for user:", userId, "course:", courseId);

        const course = await Course.findById(courseId).populate("creator", "name photoUrl")
            .populate("lectures"); // (optional but useful)
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if user is already enrolled
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: "You are already enrolled in this course" });
        }

        if (course.creator && course.creator._id.toString() === userId) {
            return res.status(400).json({ message: "Instructors cannot purchase their own course" });
        }

        // Create a new course purchase record
        const newPurchase = new CoursePurchase({
            course: courseId,
            userId,
            amount: course.coursePrice,
            status: "pending",
        });

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: course.courseTitle,
                        description: course.subTitle || (course.description && course.description !== "undefined" ? course.description.replace(/<[^>]*>/g, "").slice(0, 500) : undefined),
                        images: course.courseThumbnail ? [course.courseThumbnail] : undefined
                    },
                    unit_amount: course.coursePrice * 100, // amount in paise
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/course-detail/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId,
            },
        });

        if (!session.url) {
            return res.status(500).json({ success: false, message: "Failed to create checkout session" });
        }

        // Save the purchase record with the session id
        newPurchase.paymentId = session.id;
        await newPurchase.save();

        return res.status(200).json({ success: true, url: session.url });

    } catch (error) {
        console.log("Error creating checkout session:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create checkout session",
            error: error.message
        });
    }
}

export const webhookController = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.log("Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different Stripe webhook event types
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            console.log("Processing webhook for session:", session.id);

            try {
                // Update purchase record
                const purchase = await CoursePurchase.findOneAndUpdate(
                    { paymentId: session.id },
                    { status: "completed" },
                    { new: true }
                );

                if (purchase) {
                    // Enroll user in the course (GUARANTEED ENROLLMENT)
                    const userUpdateResult = await User.findByIdAndUpdate(
                        purchase.userId,
                        { $addToSet: { enrolledCourses: purchase.course } },
                        { new: true }
                    );

                    const courseUpdateResult = await Course.findByIdAndUpdate(
                        purchase.course,
                        { $addToSet: { enrolledStudents: purchase.userId } },
                        { new: true }
                    );

                    console.log(`Webhook enrollment completed - User: ${userUpdateResult ? 'Success' : 'Failed'}, Course: ${courseUpdateResult ? 'Success' : 'Failed'}`);
                    console.log(`User ${purchase.userId} enrolled in course ${purchase.course}`);
                } else {
                    console.log("No purchase record found for session:", session.id);
                }
            } catch (error) {
                console.error("Error processing webhook:", error);
                // Don't return error to Stripe - we still want to acknowledge receipt
            }
            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object;
            console.log("Checkout session expired:", session.id);
            await CoursePurchase.updateOne(
                { paymentId: session.id },
                { status: "failed" }
            );
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
};
// This endpoint can be used to verify payment status after redirection from Stripe
export const verifyPayment = async (req, res) => {
    try {
        const userId = req.id;
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Check if payment was successful
        if (session.payment_status === "paid") {
            // Update purchase record
            const purchase = await CoursePurchase.findOneAndUpdate(
                { paymentId: sessionId },
                { status: "completed" },
                { new: true }
            );

            if (purchase) {
                // Only the buyer may verify their own purchase
                if (purchase.userId.toString() !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: "This purchase belongs to a different user"
                    });
                }

                // Enroll the purchase owner (NOT necessarily the caller)
                const userUpdateResult = await User.findByIdAndUpdate(
                    purchase.userId,
                    { $addToSet: { enrolledCourses: purchase.course } },
                    { new: true }
                );

                const courseUpdateResult = await Course.findByIdAndUpdate(
                    purchase.course,
                    { $addToSet: { enrolledStudents: purchase.userId } }
                );

                console.log(`Enrollment updated - User: ${userUpdateResult ? 'Success' : 'Failed'}, Course: ${courseUpdateResult ? 'Success' : 'Failed'}`);

                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully. You are now enrolled in the course!",
                    purchase,
                    enrollment: {
                        userEnrolled: userUpdateResult?.enrolledCourses?.includes(purchase.course.toString()),
                        courseEnrolled: true // $addToSet always succeeds silently
                    }
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Purchase record not found"
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment not completed"
            });
        }
    } catch (error) {
        console.log("Error verifying payment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message
        });
    }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
    try {
        const userId = req.id;
        const { courseId } = req.params;

        const course = await Course.findById(courseId).populate({ path: "creator", select:"name photoUrl isDemo teachingTopic" }).populate({ path: "lectures" });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if user is the course creator (instructor) - they get automatic access
        const isCreator = course.creator && course.creator._id.toString() === userId;

        // If user is creator, they have access without purchase
        // Otherwise, check if they have purchased the course
        let purchased = isCreator;
        if (!purchased) {
            const purchaseRecord = await CoursePurchase.findOne({ course: courseId, userId, status: "completed" });
            purchased = !!purchaseRecord;
        }

        return res.status(200).json({
            success: true,
            course,
            purchased
        });
    } catch (error) {
        console.log("Error fetching course details:", error);
        return res.status(500).json({ message: "Failed to fetch course details", error: error.message });
    }
}

export const getAllPurchasedCourse = async (req, res) => {
    try {
        const userId = req.id;

        // Get all courses created by this instructor
        const instructorCourses = await Course.find({ creator: userId }).select('_id');
        const instructorCourseIds = instructorCourses.map(course => course._id);

        // Get purchases for instructor's courses only
        const purchasedCourse = await CoursePurchase.find({
            status: "completed",
            course: { $in: instructorCourseIds }
        }).populate("course");

        return res.status(200).json({
            purchasedCourse: purchasedCourse || []
        });

    } catch (error) {
        console.log("Error fetching purchased courses:", error);
        return res.status(500).json({ message: "Failed to fetch purchased courses", error: error.message });
    }
}
