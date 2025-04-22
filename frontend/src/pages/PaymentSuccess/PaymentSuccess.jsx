import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { HiCheckCircle, HiArrowLeft, HiHome, HiDocument } from 'react-icons/hi';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactionStatus = async () => {
            try {
                // Get query parameters from URL
                const queryParams = new URLSearchParams(location.search);
                const tx_ref = queryParams.get('tx_ref');
                const status = queryParams.get('status');

                // If we have order details from state, use them
                if (location.state?.orderDetails) {
                    setOrderDetails(location.state.orderDetails);
                    setLoading(false);
                    return;
                }

                // Otherwise verify the transaction with the backend
                if (tx_ref) {
                    const response = await axios.get(`http://localhost:4000/api/order/verify?tx_ref=${tx_ref}`);

                    if (response.data.success) {
                        setOrderDetails(response.data.order);
                        toast.success('Payment verified successfully!');
                    } else {
                        setError('Failed to verify transaction.');
                        toast.error('Failed to verify transaction.');
                    }
                } else {
                    setError('No transaction reference found.');
                    toast.error('No transaction reference found.');
                }
            } catch (error) {
                console.error('Error verifying transaction:', error);
                setError('Error verifying transaction. Please contact support.');
                toast.error('Error verifying transaction. Please contact support.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionStatus();
    }, [location]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-xl font-semibold text-gray-700">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Payment Verification Failed</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-8">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-600 hover:bg-gray-700"
                        >
                            <HiHome className="mr-2" /> Return Home
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            <HiDocument className="mr-2" /> Contact Support
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                        <HiCheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">Payment Successful!</h2>
                    <p className="mt-2 text-gray-600">Your order has been received and is being processed.</p>
                </div>

                {orderDetails && (
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Order Summary</h3>
                        <div className="border rounded-md overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-700">Order ID</p>
                                    <p className="text-sm text-gray-800">{orderDetails._id || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="px-4 py-3 border-b">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-700">Order Type</p>
                                    <p className="text-sm text-gray-800 capitalize">{orderDetails.TypeOfOrder || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-700">Delivery Date</p>
                                    <p className="text-sm text-gray-800">
                                        {orderDetails.DeliveryDate ? formatDate(orderDetails.DeliveryDate) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="px-4 py-3 border-b">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-700">Total Amount</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {orderDetails.totalAmount ? `${orderDetails.totalAmount.toLocaleString()} Birr` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3">
                                <div className="flex justify-between">
                                    <p className="text-sm font-medium text-gray-700">Payment Status</p>
                                    <p className="text-sm font-medium text-green-600 capitalize">
                                        {orderDetails.paymentStatus || 'Paid'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-600 hover:bg-gray-700"
                    >
                        <HiHome className="mr-2" /> Return Home
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full sm:w-1/2 flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        <HiDocument className="mr-2" /> View Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess; 