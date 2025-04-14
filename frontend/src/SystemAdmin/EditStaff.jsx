import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    role: "",
    password: "",
    photo: null,
  });

  useEffect(() => {
    fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get(`/staff/${id}`);
      setStaff(response.data.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in staff) {
      formData.append(key, staff[key]);
    }

    try {
      await axiosInstance.put(`http://localhost:4000/api/admin/update/${id}
      }`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Staff updated successfully!");
      navigate("/staff/list");
    } catch (error) {
      toast.error("Error updating staff");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Staff</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Form fields similar to CreateStaff.jsx */}
        <button type="submit" className="mt-6 bg-blue-500 text-white px-4 py-2 rounded">
          Update Staff
        </button>
      </form>
    </div>
  );
};

export default EditStaff;
