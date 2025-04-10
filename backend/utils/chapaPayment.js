// import axios from "axios";

// import dotenv from 'dotenv';
// import { body, validationResult } from 'express-validator';
// import { Chapa } from 'chapa-nodejs';
// // Load environment variables
// dotenv.config();

// const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
// const CHAPA_API_URL = process.env.CHAPA_API_URL;

// const chapa = new Chapa({
//     secretKey:CHAPA_SECRET_KEY,
//   });
// // Validate environment variables
// if (!CHAPA_SECRET_KEY) {
//     throw new Error("CHAPA_SECRET_KEY is not defined in the environment variables.");
// }
// if (!CHAPA_API_URL) {
//     throw new Error("CHAPA_API_URL is not defined in the environment variables.");
// }
// const tx_ref = await chapa.genTxRef();
// console.log("tx_ref:", tx_ref);
// // export const processChapaPayment = async (amount, description) => {
//     export const processChapaPayment = async () => {
//     try {
//         const response = await axios.post(
//             CHAPA_API_URL,
           
//               {first_name: 'John',
//   last_name: 'Doe',
//   email: 'john@gmail.com',
//   phone_number: '0911121314',
//   currency: 'ETB',
//   amount: '200',
//   tx_ref: tx_ref,
//   callback_url: 'https://example.com/',
//   return_url: 'https://example.com/',
//   customization: {
//     title: 'Test Title',
//     description: 'Test Description',
//   },
// },
//             {
//                 headers: {
//                     Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
//                 },
//             }
//         );

//         if (response.data.status === "success") {
//             // if (!response.data.data.txn_id) {
//             //     return { 
//             //         success: false, 
//             //         error: "Payment failed or transaction ID is missing" 
//             //     };
//             // }
//             return { success: true, transactionId: response.data };
//         } else {
//             return { success: false, error: response.data.message };
//         }
//     } catch (error) {
//         console.error("Error processing Chapa payment:", error.response?.data || error.message);
//         return { 
//             success: false, 
//             error: error.response?.data?.message || error.message,
//             details: error.response?.data?.message?.email || null // Extract email validation errors if present
//         };
//     }
// };

import axios from "axios";
import dotenv from 'dotenv';
import { Chapa } from 'chapa-nodejs';

// Load environment variables
dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = process.env.CHAPA_API_URL;

const chapa = new Chapa({ secretKey: CHAPA_SECRET_KEY });

// Validate environment variables
if (!CHAPA_SECRET_KEY || !CHAPA_API_URL) {
    throw new Error("Chapa API credentials are missing in .env file");
}

export const processChapaPayment = async (amount, description, user) => {
    try {
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
                callback_url: 'https://your-callback-url.com',
                return_url: 'https://your-return-url.com',
                customization: {
                    title: 'Order Payment',
                    description: description || 'Payment for Order',
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
                transactionId: tx_ref,
                checkoutUrl: response.data.data.checkout_url 
            };
        } else {
            return { success: false, error: response.data.message };
        }
    } catch (error) {
        console.error("Error processing Chapa payment:", error.response?.data || error.message);
        return { 
            success: false, 
            error: error.response?.data?.message || error.message 
        };
    }
};
