import { apiClient } from "./apiClient";

export interface SupportRequest {
    name: string;
    supportType: string;
    description: string;
}

export const supportService = {
    submitRequest: async (data: SupportRequest): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>("/support/submit", data);
        return response.data;
    }
};