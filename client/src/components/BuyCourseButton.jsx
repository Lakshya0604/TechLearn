import React, { useEffect } from 'react'
import { Button } from './ui/button';
import { useCreateCheckoutSessionMutation } from '@/features/api/purchaseApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BuyCourseButton = ({ courseId }) => {
    const [createCheckoutSession, { data, isLoading, isError, error, isSuccess, reset }] = useCreateCheckoutSessionMutation();

    const purchaseCourseHandler = async (courseId) => {
        await createCheckoutSession(courseId);
    };

    useEffect(() => {
        if (isSuccess) {
            if (data && data.url) {
                window.location.href = data.url;
            } else {
                toast.error("Failed to create checkout session. Please try again.");
                reset();
            }
        }

        if (isError) {
            // Extract error message from the response
            const errorMessage = error?.data?.message || error?.data?.error || "Failed to create checkout session";
            toast.error(errorMessage);
            console.error("Checkout error:", error);
            reset(); // Reset mutation state to allow retry
        }
    }, [data, isError, isSuccess, error, reset]);

    return (
        <Button disabled={isLoading} className='w-full' onClick={() => purchaseCourseHandler(courseId)}>
            {
                isLoading ? <><Loader2 className='animate-spin' /> Please wait...</> : ("Purchase Course")
            }
        </Button>
    )
}

export default BuyCourseButton;