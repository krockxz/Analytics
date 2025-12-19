import { Router } from 'express';
import { createEvent, getHeatmapData } from '../controllers/eventsController';

const router = Router();

// POST /api/v1/events - Create new event
router.post('/', createEvent);

// GET /api/v1/events/heatmap - Get heatmap data
router.get('/heatmap', getHeatmapData);

export default router;