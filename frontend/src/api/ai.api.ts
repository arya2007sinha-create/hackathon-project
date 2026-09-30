import { apiClient } from './client';

export interface AiAssistantResponse {
  answer: string;
  source: 'GEMINI_AI' | 'DETERMINISTIC_ENGINE';
  suggestedAction?: string;
  dataPointsUsed: string[];
}

export const aiApi = {
  askAssistant: async (query: string): Promise<AiAssistantResponse> => {
    const res = await apiClient.post('/ai/insights', { query });
    return res.data.data;
  },

  explainTask: async (taskId: string): Promise<any> => {
    const res = await apiClient.post('/ai/explain', { taskId });
    return res.data.data;
  },

  prioritize: async (employeeId?: string): Promise<any[]> => {
    const res = await apiClient.post('/ai/prioritize', { employeeId });
    return res.data.data;
  },
};
