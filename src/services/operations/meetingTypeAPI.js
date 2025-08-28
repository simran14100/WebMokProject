import { apiConnector } from '../apiConnector';
import { meetingTypeEndpoints } from '../apis';
import { toast } from 'react-hot-toast';

// Get all meeting types
export const getAllMeetingTypes = async (params = {}) => {
    try {
        const { page = 1, limit = 10, search = '', isActive = '' } = params;
        
        const response = await apiConnector('GET', meetingTypeEndpoints.GET_ALL_MEETING_TYPES, null, {
            params: { page, limit, search, isActive }
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch meeting types');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching meeting types:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch meeting types');
        throw error;
    }
};

// Get active meeting types for dropdown
export const getActiveMeetingTypes = async () => {
    try {
        const response = await apiConnector('GET', meetingTypeEndpoints.GET_ACTIVE_MEETING_TYPES);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch active meeting types');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching active meeting types:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch active meeting types');
        throw error;
    }
};

// Get meeting type by ID
export const getMeetingTypeById = async (id) => {
    try {
        const response = await apiConnector('GET', `${meetingTypeEndpoints.GET_MEETING_TYPE_BY_ID}/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch meeting type');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching meeting type:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch meeting type');
        throw error;
    }
};

// Create new meeting type
export const createMeetingType = async (data) => {
    const toastId = toast.loading('Creating meeting type...');
    try {
        const response = await apiConnector('POST', meetingTypeEndpoints.CREATE_MEETING_TYPE, data);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create meeting type');
        }

        toast.success('Meeting type created successfully', { id: toastId });
        return response.data;
    } catch (error) {
        console.error('Error creating meeting type:', error);
        toast.error(error.response?.data?.message || 'Failed to create meeting type', { id: toastId });
        throw error;
    }
};

// Update meeting type
export const updateMeetingType = async (id, data) => {
    const toastId = toast.loading('Updating meeting type...');
    try {
        const response = await apiConnector('PUT', `${meetingTypeEndpoints.UPDATE_MEETING_TYPE}/${id}`, data);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update meeting type');
        }

        toast.success('Meeting type updated successfully', { id: toastId });
        return response.data;
    } catch (error) {
        console.error('Error updating meeting type:', error);
        toast.error(error.response?.data?.message || 'Failed to update meeting type', { id: toastId });
        throw error;
    }
};

// Delete meeting type
export const deleteMeetingType = async (id) => {
    const toastId = toast.loading('Deleting meeting type...');
    try {
        const response = await apiConnector('DELETE', `${meetingTypeEndpoints.DELETE_MEETING_TYPE}/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete meeting type');
        }

        toast.success('Meeting type deleted successfully', { id: toastId });
        return response.data;
    } catch (error) {
        console.error('Error deleting meeting type:', error);
        toast.error(error.response?.data?.message || 'Failed to delete meeting type', { id: toastId });
        throw error;
    }
};
