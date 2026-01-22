import { CreateTaskRequest, CreateTaskResponse, QueryTaskResponse, MotionControlInput, NanoBananaInput, ImageEditInput } from '../types';

const BASE_URL = 'https://api.kie.ai/api/v1/jobs';

export const createTask = async (apiKey: string, model: string, input: MotionControlInput | NanoBananaInput | ImageEditInput): Promise<CreateTaskResponse> => {
  const payload: CreateTaskRequest = {
    model: model,
    input: input,
  };

  const response = await fetch(`${BASE_URL}/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const queryTask = async (apiKey: string, taskId: string): Promise<QueryTaskResponse> => {
  const response = await fetch(`${BASE_URL}/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Query Request Failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};