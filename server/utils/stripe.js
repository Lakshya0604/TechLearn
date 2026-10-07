import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Single shared Stripe instance. Tests replace methods on this object,
// so controllers must import it from here instead of constructing their own.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

export default stripe;
