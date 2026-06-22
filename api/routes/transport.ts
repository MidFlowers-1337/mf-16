import { Router } from 'express';
import { TransportService } from '../services/TransportService';

const router = Router();

router.get('/schedule', (req, res) => {
  const days = parseInt(req.query.days as string, 10) || 30;
  const schedule = TransportService.getSchedule(days);
  res.json(schedule);
});

export default router;
