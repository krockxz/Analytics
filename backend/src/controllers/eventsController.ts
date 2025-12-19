import { Request, Response } from 'express';
import { EventModel } from '../models/Event';
import { SessionModel } from '../models/Session';
import { CreateEventRequest } from '../../../shared/types/analytics';

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    // Check if this is a batch of events or a single event
    const events = Array.isArray(body) ? body : [body];

    const savedEvents = [];

    for (const eventData of events) {
      // Validate required fields
      if (!eventData.sessionId || !eventData.type || !eventData.url) {
        continue; // Skip invalid events
      }

      // Create event
      const event = new EventModel({
        ...eventData,
        timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date()
      });

      await event.save();
      savedEvents.push(event);

      // Update or create session
      await SessionModel.findOneAndUpdate(
        { sessionId: eventData.sessionId },
        {
          $setOnInsert: {
            sessionId: eventData.sessionId,
            startTime: new Date(),
            isActive: true
          },
          $inc: {
            eventCount: 1,
            pageViews: eventData.type === 'page_view' ? 1 : 0,
            clicks: eventData.type === 'click' ? 1 : 0
          },
          $set: {
            lastActivity: new Date(),
            userAgent: eventData.data?.userAgent,
            endTime: null
          }
        },
        {
          upsert: true,
          new: true
        }
      );
    }

    res.status(201).json({
      data: {
        count: savedEvents.length,
        events: savedEvents.map(e => ({
          eventId: e._id,
          sessionId: e.sessionId,
          timestamp: e.timestamp
        }))
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create event',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};

export const getHeatmapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, startDate, endDate } = req.query;

    if (!url) {
      res.status(400).json({
        error: {
          message: 'URL is required',
          code: 'VALIDATION_ERROR'
        }
      });
      return;
    }

    // Build query
    const query: any = {
      type: 'click',
      url: decodeURIComponent(url as string)
    };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    // Aggregation pipeline for heatmap data
    const heatmapData = await EventModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            x: '$data.x',
            y: '$data.y'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          clicks: {
            $push: {
              x: '$_id.x',
              y: '$_id.y',
              count: '$count'
            }
          },
          totalClicks: { $sum: '$count' },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          _id: 0,
          url: query.url,
          clicks: 1,
          totalClicks: 1,
          uniqueSessions: { $size: '$uniqueSessions' }
        }
      }
    ]);

    const result = heatmapData[0] || {
      url: query.url,
      clicks: [],
      totalClicks: 0,
      uniqueSessions: 0
    };

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch heatmap data',
        code: 'INTERNAL_ERROR'
      }
    });
  }
};