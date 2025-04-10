import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaUserCircle, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useStore } from "../context/StoreContext";

const ListStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');
  const { token } = useStore();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/admin/staffs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const staffData = response.data?.staffs || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error(error.response?.data?.message || "Failed to fetch accounts list");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await axios.delete(`http://localhost:4000/api/admin/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Account deleted successfully");
        fetchStaff();
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(error.response?.data?.message || "Failed to delete account");
      }
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'catering_manager':
        return 'Catering Manager';
      case 'executive_chef':
        return 'Executive Chef';
      case 'customer':
        return 'Customer';
      default:
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'executive_chef':
        return 'bg-blue-100 text-blue-800';
      case 'catering_manager':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredStaff = selectedRole === 'all' 
    ? staff
    : staff.filter(member => member?.role === selectedRole);

  return (
    <div className="p-6 ml-64">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Account Management</h2>
          <div className="flex gap-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="executive_chef">Chefs</option>
              <option value="catering_manager">Managers</option>
              <option value="customer">Customers</option>
            </select>
            <Link
              to="/admin/createaccount"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create New Account
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading accounts...</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUserCircle className="h-8 w-8 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {account.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(account.role)}`}>
                        {getRoleDisplayName(account.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/edituser/${account._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit className="h-5 w-5 inline" />
                      </Link>
                      <button
                        onClick={() => deleteStaff(account._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStaff.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No accounts found for the selected role.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListStaff;
