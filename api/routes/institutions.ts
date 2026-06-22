import { Router } from 'express';
import { InstitutionService } from '../services/InstitutionService';

const router = Router();

router.get('/', (_req, res) => {
  const institutions = InstitutionService.getAll();
  res.json(institutions);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const institution = InstitutionService.getById(id);
  if (!institution) {
    res.status(404).json({ error: '机构不存在' });
    return;
  }
  res.json(institution);
});

router.post('/', (req, res) => {
  const { name, contactPerson, contactPhone, insuranceCoverage } = req.body;
  if (!name || !contactPerson || !contactPhone) {
    res.status(400).json({ error: '机构名称、联系人、联系电话为必填项' });
    return;
  }
  const institution = InstitutionService.create({
    name,
    contactPerson,
    contactPhone,
    insuranceCoverage: Number(insuranceCoverage) || 0,
  });
  res.status(201).json(institution);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const institution = InstitutionService.update(id, req.body);
  if (!institution) {
    res.status(404).json({ error: '机构不存在' });
    return;
  }
  res.json(institution);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = InstitutionService.delete(id);
  if (!success) {
    res.status(404).json({ error: '机构不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
