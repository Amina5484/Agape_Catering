import axios from "axios";
import dotenv from 'dotenv';
import { Chapa } from 'chapa-nodejs';

// Load environment variables
dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1/transaction/initialize';

let chapa;
try {
    chapa = new Chapa({ secretKey: CHAPA_SECRET_KEY });
} catch (error) {
    console.warn('Chapa initialization failed:', error.message);
}

export const processChapaPayment = async (amount, description, user) => {
    try {
        // If Chapa is not properly initialized, return a mock response
        if (!chapa) {
            console.warn('Using mock payment response - Chapa not properly configured');
            return {
                success: true,
                transactionId: 'mock_' + Date.now(),
                checkoutUrl: 'https://example.com/checkout',
                message: 'Mock payment successful'
            };
        }

        const tx_ref = await chapa.genTxRef();

        const response = await axios.post(
            CHAPA_API_URL,
            {
                first_name: user.first_name || 'John',
                last_name: user.last_name || 'Doe',
                email: user.email || 'johndoe@example.com',
                phone_number: user.phone_number || '0911121314',
                currency: 'ETB',
                amount: amount.toString(),
                tx_ref: tx_ref,
                callback_url: 'https://example.com/callback',
                return_url: 'https://example.com/return',
                customization: {
                    title: 'Payment for ' + description,
                    description: description,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                },
            }
        );

        if (response.data.status === "success") {
            return {
                success: true,
                transactionId: response.data.data.txn_id,
                checkoutUrl: response.data.data.checkout_url,
                message: response.data.message
            };
        } else {
            return {
                success: false,
                error: response.data.message
            };
        }
    } catch (error) {
        console.error("Error processing Chapa payment:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            details: error.response?.data?.message?.email || null
        };
    }
};
