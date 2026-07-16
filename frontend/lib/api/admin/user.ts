import { API } from "../endpoints";
import axios from "../axios";

export const createUser = async (userData: any) => {
    try {
        const response = await axios.post(
            API.ADMIN.USERS,
            userData,   
            {
                headers: {
                    'Content-Type': 'multipart/form-data', // for file upload/multer
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}

// Fetch users with pagination and search
export const fetchUsers = async (page: number = 1, size: number = 10, search?: string) => {
  try {
    // Build query string
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (search) {
      params.append('search', search);
    }

    const response = await axios.get(`/api/v1/admin/users?${params.toString()}`);
    return response.data; 
  } catch (error: any) {
    console.error("Error fetching users:", error.response?.data || error.message);
    return { 
      success: false, 
      data: [], 
      pagination: { 
        page: 1, size: 10,
        total: 0, totalPages: 0 },
      message: error.response?.data?.message || error.message 
    };
  }
};

// Delete user by ID
export const deleteUserById = async (userId: string) => {
  try {
    const response = await axios.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Delete user failed');
  }
};

// Get single user by ID
export const getUserById = async (userId: string) => {
  try {
    const response = await axios.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Fetch user failed');
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    const response = await axios.put(
      `/api/v1/admin/users/${userId}`,
      userData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error.response?.data?.message || error.message || 'Update user failed');
  }
};