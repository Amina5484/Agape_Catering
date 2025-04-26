import axios from 'axios';

export const assignSchedule = async (
  orderId,
  chefId,
  shiftTime = 'morning',
  date = new Date().toISOString().split('T')[0]
) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      'http://localhost:4000/api/catering/schedule/assign',
      {
        orderId,
        chefId,
        shiftTime,
        date,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error assigning schedule:', error);
    throw error;
  }
};

export const getChefSchedules = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      'http://localhost:4000/api/chef/schedules',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching chef schedules:', error);
    throw error;
  }
};

export const getAllSchedules = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(
      'http://localhost:4000/api/catering/schedule',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching all schedules:', error);
    throw error;
  }
};
