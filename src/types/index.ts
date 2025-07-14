export interface User {
  clientId: string;
  email: string;
  signupDate: string;
}

export interface Farm {
  id: string;
  clientId: string;
  name: string;
  createdAt: string;
  imageCount: number;
}

export interface ImageFile {
  id: string;
  filename: string;
  url: string;
  type: 'raw' | 'mosaic' | 'indices';
  uploadDate: string;
  size: number;
}

export interface ProcessingJob {
  id: string;
  clientId: string;
  farmId: string;
  indices: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
}

export interface UserProfile {
  clientId: string;
  email: string;
  signupDate: string;
  farmsCount: number;
  imagesCount: number;
  totalProcessingJobs: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (clientId: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}