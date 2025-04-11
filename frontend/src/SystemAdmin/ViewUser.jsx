import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useStore } from "../context/StoreContext";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    isactivated: true
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

    const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        role: response.data.role || "",
        isactivated: response.data.isactivated
      });
      } catch (error) {
        console.error("Error fetching user:", error);
      toast.error(error.response?.data?.message || "Failed to fetch user details");
      navigate("/admin/liststaff");
      } finally {
        setLoading(false);
      }
    };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:4000/api/users/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("User updated successfully");
      setIsEditing(false);
      fetchUser();
      } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:4000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("User deleted successfully");
        navigate("/admin/liststaff");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  if (loading) {
    return <div className="p-6 ml-64">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 ml-64">User not found</div>;
  }

  return (
    <div className="p-6 ml-64">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Details</h2>
          <div className="space-x-4">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
        <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="kitchen">Kitchen</option>
                <option value="delivery">Delivery</option>
                <option value="customer">Customer</option>
              </select>
        </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isactivated"
                checked={formData.isactivated}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Active Account</label>
      </div>
            <div className="flex justify-end space-x-4">
        <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
                Cancel
        </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Save Changes
        </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Name</h3>
              <p className="mt-1 text-sm text-gray-500">{user.name}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Phone</h3>
              <p className="mt-1 text-sm text-gray-500">{user.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Role</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user.isactivated ? "Active" : "Inactive"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Created At</h3>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUser;