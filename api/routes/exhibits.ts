import { Router } from 'express';
import { ExhibitService } from '../services/ExhibitService';
import type { ExhibitStatus } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  const { category, status, search } = req.query;
  const exhibits = ExhibitService.getAll({
    category: category as string | undefined,
    status: status as ExhibitStatus | undefined,
    search: search as string | undefined,
  });
  res.json(exhibits);
});

router.get('/categories', (_req, res) => {
  const categories = ExhibitService.getCategories();
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const exhibit = ExhibitService.getById(id);
  if (!exhibit) {
    res.status(404).json({ error: '展品不存在' });
    return;
  }
  res.json(exhibit);
});

router.post('/', (req, res) => {
  const { name, category, insuranceValue, requiresTemperatureControl, status } = req.body;
  if (!name || !category) {
    res.status(400).json({ error: '展品名称和类别为必填项' });
    return;
  }
  const exhibit = ExhibitService.create({
    name,
    category,
    insuranceValue: Number(insuranceValue) || 0,
    requiresTemperatureControl: Boolean(requiresTemperatureControl),
    status: status || 'in_house',
  });
  res.status(201).json(exhibit);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const exhibit = ExhibitService.update(id, req.body);
  if (!exhibit) {
    res.status(404).json({ error: '展品不存在' });
    return;
  }
  res.json(exhibit);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = ExhibitService.delete(id);
  if (!success) {
    res.status(404).json({ error: '展品不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
