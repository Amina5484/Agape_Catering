 import React, { useEffect } from 'react';
 import { StoreContext } from '../context/StoreContext';
 import { useContext } from 'react';

 const ViewFeedback = () => {
   const { feedbackList, fetchFeedbackList } = useContext(StoreContext);

   useEffect(() => {
     fetchFeedbackList(); // Fetch feedback when component loads
   }, []);

   return (
     <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
       <h2 className="text-2xl font-bold text-center mb-4">
         Customer Feedback
       </h2>
       {feedbackList.length === 0 ? (
         <p className="text-center">No feedback available.</p>
       ) : (
         <ul className="space-y-4">
           {feedbackList.map((feedback, index) => {
             console.log('Rendering Feedback Item:', feedback); // Debugging
             return (
               <li key={index} className="p-4 border rounded-lg bg-gray-50">
                 <p>
                   <strong>Name:</strong> {feedback.name}
                 </p>
                 <p>
                   <strong>Email:</strong> {feedback.email}
                 </p>
                 <p>
                   <strong>Phone:</strong> {feedback.phone}
                 </p>
                 <p>
                   <strong>Message:</strong> {feedback.feedback}
                 </p>
               </li>
             );
           })}
         </ul>
       )}
     </div>
   );
 };

 export default ViewFeedback;