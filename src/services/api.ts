import axios from 'axios';
import { ImageFile, ProcessingJob, UserProfile, Farm } from '../types';

const API_BASE_URL = 'https://kilimoanga-angaview-backend.victoriousbay-b086caac.southafricanorth.azurecontainerapps.io';

export const apiService = {
    // Upload files
    uploadFiles: async (
        clientId: string,
        farmId: string,
        farmName: string,
        files: FileList,
        token: string,
        onProgress?: (percent: number) => void
    ): Promise<boolean> => {
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("clientId", clientId);
                formData.append("farmId", farmId);
                formData.append("farmName", farmName);
                formData.append("file", file);

                await axios.post(`${API_BASE_URL}/upload`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            if (onProgress) onProgress(percent);
                        }

                    }
                });
                if (onProgress) {
                    onProgress(100); // show full bar
                    await new Promise((res) => setTimeout(res, 300)); // slight delay
                    onProgress(0);    // reset before next file
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    },

    // List files
    listFiles: async (
        clientId: string,
        farmId: string,
        type: 'raw' | 'mosaic' | 'indices',
        token: string
    ): Promise<ImageFile[]> => {
        const res = await axios.get(`${API_BASE_URL}/users/${clientId}/gallery`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                farm_id: farmId,
                file_type: type
            }
        });
        return res.data;
    },

    // Process indices
    processIndices: async (clientId: string, farmId: string, indices: string[], token: string): Promise<ProcessingJob> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const res = await axios.post(`${API_BASE_URL}/process`, {
            clientId,
            farmId,
            indices,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        return res.data;
    },

    // Check processing status
    checkStatus: async (clientId: string, farmId: string, token: string): Promise<ProcessingJob | null> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        ///change this to your actual endpoint
        const res = await axios.get(`${API_BASE_URL}/status`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                clientId,
                farmId
            }
        });

        return res.data;
    },

    // Get user profile
    getUserProfile: async (clientId: string, email: string, displayName: string, token: string): Promise<UserProfile> => {
        const res = await axios.get(`${API_BASE_URL}/users/${clientId}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                email,
                displayName
            }
        });
        return res.data;
    },


    // Get user farms
    getUserFarms: async (clientId: string, token: string): Promise<Farm[]> => {
        const res = await axios.get(`${API_BASE_URL}/users/${clientId}/farms`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data;
    },

    // Get farm details
    getFarmDetails: async (clientId: string, farmId: string, token: string): Promise<any> => {
        const res = await axios.get(`${API_BASE_URL}/users/${clientId}/farms/${farmId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data;
    },

    // Get farm analytics
    getFarmAnalytics: async (farmId: string, token: string): Promise<any[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [];
    },

    // Get farm advisories
    getFarmAdvisories: async (farmId: string, token: string): Promise<any[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [];
    },

};