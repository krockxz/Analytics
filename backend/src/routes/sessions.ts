import { Router } from 'express';
import { getSessions, getSessionEvents, getSessionJourney } from '../controllers/sessionsController';

const router = Router();

// GET /api/v1/sessions - Get all sessions
router.get('/', getSessions);

// GET /api/v1/sessions/:sessionId/events - Get events for a session
router.get('/:sessionId/events', getSessionEvents);

// GET /api/v1/sessions/:sessionId/journey - Get user journey
router.get('/:sessionId/journey', getSessionJourney);

export default router;