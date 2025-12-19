import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Session {
  _id: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  eventCount: number;
  pageViews: number;
  clicks: number;
  isActive: boolean;
  lastActivity: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

export interface Event {
  _id: string;
  sessionId: string;
  type: 'page_view' | 'click';
  url: string;
  timestamp: string;
  data?: {
    x?: number;
    y?: number;
    element?: string;
    elementId?: string;
    elementClass?: string;
    title?: string;
    referrer?: string;
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
}

export interface SessionsResponse {
  data: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HeatmapData {
  url: string;
  clicks: Array<{
    x: number;
    y: number;
    count: number;
  }>;
  totalClicks: number;
  uniqueSessions: number;
}

// API functions
export const analyticsApi = {
  // Sessions
  async getSessions(page = 1, limit = 20): Promise<SessionsResponse> {
    const response = await api.get(`/sessions?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getSessionEvents(sessionId: string): Promise<{ data: Event[]; session: Session }> {
    const response = await api.get(`/sessions/${sessionId}/events`);
    return response.data;
  },

  async getSessionJourney(sessionId: string): Promise<{ data: Array<any> }> {
    const response = await api.get(`/sessions/${sessionId}/journey`);
    return response.data;
  },

  // Events
  async getHeatmapData(url: string, startDate?: string, endDate?: string): Promise<{ data: HeatmapData }> {
    const params = new URLSearchParams({ url });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/events/heatmap?${params}`);
    return response.data;
  },
};

export default api;