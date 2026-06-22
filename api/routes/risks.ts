import { Router } from 'express';
import { RiskService } from '../services/RiskService';
import type { RiskSeverity } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  const { severity, resolved } = req.query;
  const risks = RiskService.getAll({
    severity: severity as RiskSeverity | undefined,
    resolved: resolved === undefined ? undefined : resolved === 'true',
  });
  res.json(risks);
});

router.post('/:id/resolve', (req, res) => {
  const { id } = req.params;
  const risk = RiskService.resolve(id);
  if (!risk) {
    res.status(404).json({ error: '风险不存在' });
    return;
  }
  res.json(risk);
});

export default router;
