import { Request, Response } from 'express';
import { EventModel } from '../models/Event';
import { SessionModel } from '../models/Session';

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (req.query.activeOnly === 'true') {
      filter.isActive = true;
    }

    // Get sessions with pagination
    const [sessions, total] = await Promise.all([
      SessionModel.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SessionModel.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch sessions',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

export const getSessionEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({
        error: {
          message: 'Session ID is required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    // Get session details
    const session = await SessionModel.findOne({ sessionId });
    if (!session) {
      res.status(404).json({
        error: {
          message: 'Session not found',
          code: 'NOT_FOUND'
        }
      });
      return;
    }

    // Get session events
    const events = await EventModel.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      data: events,
      session
    });
  } catch (error) {
    console.error('Error fetching session events:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch session events',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

export const getSessionJourney = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      res.status(400).json({
        error: {
          message: 'Session ID is required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    // Get session events and build journey
    const events = await EventModel.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();

    const journey = events.map(event => ({
      timestamp: event.timestamp,
      type: event.type,
      url: event.url,
      details: event.type === 'click'
        ? { x: event.data?.x, y: event.data?.y, element: event.data?.element }
        : { title: event.data?.title }
    }));

    res.json({ data: journey });
  } catch (error) {
    console.error('Error fetching session journey:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch session journey',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};