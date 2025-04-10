// src/components/Settings/Settings.js

import React from 'react';

const SystemSettings = () => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Notification Preferences:</label>
          <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
            <option>Email</option>
            <option>SMS</option>
            <option>Push Notifications</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Privacy Settings:</label>
          <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
            <option>Public</option>
            <option>Private</option>
          </select>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SystemSettings;