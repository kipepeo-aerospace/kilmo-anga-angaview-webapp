import axios from 'axios';
import { ImageFile, ProcessingJob, UserProfile, Farm } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const apiService = {
    // Upload files
    uploadFiles: async (
        clientId: string,
        farmId: string,
        farmName: string,
        files: FileList,
        token: string
    ): Promise<boolean> => {
        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("clientId", clientId);
            formData.append("farmId", farmId);
            formData.append("farmName", farmName);
            formData.append("file", file);

            await axios.post("http://localhost:8000/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
        }
        return true;
    },

    // List files
    listFiles: async (
        clientId: string,
        farmId: string,
        type: 'raw' | 'mosaic' | 'indices',
        token: string
    ): Promise<ImageFile[]> => {
        const res = await axios.get(`http://localhost:8000/users/${clientId}/gallery`, {
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

        const res = await axios.post(`http://localhost:8000/process`, {
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
        const res = await axios.get(`http://localhost:8000/status`, {
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
    getUserProfile: async (clientId: string, token: string): Promise<UserProfile> => {
        const res = await axios.get(`http://localhost:8000/users/${clientId}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data;
    },


    // Get user farms
    getUserFarms: async (clientId: string, token: string): Promise<Farm[]> => {
        const res = await axios.get(`http://localhost:8000/users/${clientId}/farms`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.data;
    },

};