export interface EventData {
  sessionId: string;
  type: 'page_view' | 'click';
  url: string;
  timestamp: Date;
  data?: {
    // For click events
    x?: number;
    y?: number;
    element?: string;
    elementId?: string;
    elementClass?: string;
    // For page view events
    title?: string;
    referrer?: string;
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
}

export interface Event extends EventData {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  eventCount: number;
  pageViews: number;
  clicks: number;
  isActive: boolean;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

export interface CreateEventRequest {
  sessionId: string;
  type: 'page_view' | 'click';
  url: string;
  timestamp?: string;
  data?: any;
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

export interface SessionEventsResponse {
  data: Event[];
  session: Session;
}

export interface HeatmapData {
  x: number;
  y: number;
  count: number;
}

export interface HeatmapResponse {
  data: {
    url: string;
    clicks: HeatmapData[];
    totalClicks: number;
    uniqueSessions: number;
  };
}

export interface JourneyEvent {
  timestamp: Date;
  type: string;
  url?: string;
  details?: any;
}

export interface JourneyResponse {
  data: JourneyEvent[];
}