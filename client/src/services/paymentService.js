import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';



// Create checkout session
export const createCheckoutSession = async (courseId) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/purchase/checkout/create-checkout-session`,
            { courseId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
};

// Verify payment after redirect
export const verifyPayment = async (sessionId) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/purchase/verify-payment`,
            { sessionId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};