 import { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom'; // <-- added
 import axios from 'axios';
 import { toast } from 'react-toastify';
 import { useStore } from '../context/StoreContext';
 import { FaArrowLeft } from 'react-icons/fa';

 const ScheduleManagement = () => {
   const { token } = useStore();
   const navigate = useNavigate(); // <-- added
   const [schedules, setSchedules] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     fetchSchedules();
   }, []);

   const fetchSchedules = async () => {
     try {
       setLoading(true);
       const response = await axios.get(
         'http://localhost:4000/api/catering/schedule',
         {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         }
       );
       setSchedules(response.data);
     } catch (error) {
       console.error('Error fetching schedules:', error);
       toast.error(
         error.response?.data?.message || 'Failed to fetch schedules'
       );
     } finally {
       setLoading(false);
     }
   };

   const handleDelete = async (scheduleId) => {
     if (window.confirm('Are you sure you want to delete this schedule?')) {
       try {
         await axios.delete(
           `http://localhost:4000/api/catering/schedule/delete/${scheduleId}`,
           {
             headers: {
               Authorization: `Bearer ${token}`,
             },
           }
         );
         toast.success('Schedule deleted successfully');
         fetchSchedules();
       } catch (error) {
         console.error('Error deleting schedule:', error);
         toast.error(
           error.response?.data?.message || 'Failed to delete schedule'
         );
       }
     }
   };

   if (loading) {
     return <div className="p-6 ml-64">Loading...</div>;
   }

   return (
     <div className="p-8 bg-gray-50 min-h-screen">
       <div className="max-w-7xl mx-auto">
         <div className="flex items-center space-x-4 mb-8">
           <button
             onClick={() => navigate(-1)} // <-- added
             className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition"
           >
             <FaArrowLeft className="text-xl mt-4" />
             <span>Back</span> {/* Optional: add text if you want */}
           </button>
         </div>

         <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-blue-600">
               <tr>
                 <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                   Date
                 </th>
                 <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                   Time
                 </th>
                 <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                   Event Type
                 </th>
                 <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                   Status
                 </th>
                 <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                   Actions
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {schedules && schedules.length > 0 ? (
                 schedules.map((schedule) => (
                   <tr
                     key={schedule._id}
                     className="hover:bg-gray-50 transition duration-150"
                   >
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-800">
                         {schedule.date}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-800">
                         {schedule.time}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-800">
                         {schedule.eventType}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span
                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           schedule.status === 'Available'
                             ? 'bg-green-100 text-green-800'
                             : schedule.status === 'Booked'
                             ? 'bg-blue-100 text-blue-800'
                             : 'bg-red-100 text-red-800'
                         }`}
                       >
                         {schedule.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                       <button
                         onClick={() =>
                           toast.info('Edit functionality disabled.')
                         }
                         className="text-blue-600 hover:text-blue-800 transition duration-300 hover:scale-110"
                       >
                         Edit
                       </button>
                       <button
                         onClick={() => handleDelete(schedule._id)}
                         className="text-red-600 hover:text-red-800 transition duration-300 hover:scale-110"
                       >
                         Delete
                       </button>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td
                     colSpan="5"
                     className="px-6 py-8 text-center text-gray-500"
                   >
                     <div className="flex flex-col items-center space-y-2">
                       <svg
                         className="w-12 h-12 text-gray-400"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                         />
                       </svg>
                       <p className="text-lg">No schedules found.</p>
                     </div>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   );
 };

 export default ScheduleManagement;
