import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

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