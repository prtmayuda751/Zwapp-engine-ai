export interface MotionControlInput {
  prompt: string;
  input_urls: string[];
  video_urls: string[];
  character_orientation: 'image' | 'video';
  mode: '720p' | '1080p';
}

export interface NanoBananaInput {
  prompt: string;
  image_input: string[];
  aspect_ratio: string;
  resolution: string;
  output_format: string;
}

export interface ImageEditInput {
  prompt: string;
  image_url: string;
  negative_prompt?: string;
  image_size?: string;
  output_format?: 'png' | 'jpeg';
  acceleration?: 'none' | 'regular' | 'high';
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  enable_safety_checker?: boolean;
  sync_mode?: boolean;
  num_images?: string;
}

export interface ZImageInput {
  prompt: string;
  aspect_ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

export interface CreateTaskRequest {
  model: string; 
  input: MotionControlInput | NanoBananaInput | ImageEditInput | ZImageInput;
  callBackUrl?: string;
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface TaskRecordInfo {
  taskId: string;
  model: string;
  state: 'waiting' | 'success' | 'fail';
  param: string; // JSON string
  resultJson?: string; // JSON string containing results
  failCode?: string | null;
  failMsg?: string | null;
  costTime?: number | null;
  completeTime?: number | null;
  createTime: number;
}

export interface LocalTask extends TaskRecordInfo {
  progress: number; // 0-100
  isRead: boolean;
  queuePosition?: number;
}

export interface QueryTaskResponse {
  code: number;
  msg: string;
  data: TaskRecordInfo;
}

export interface ParsedResult {
  resultUrls: string[];
}

export interface ApiConfig {
  apiKey: string;
}