import { Router } from 'express';
import { LoanService, detectRisksForLoan } from '../services/LoanService';
import type { CreateLoanRequest, LoanStatus } from '../../shared/types';

const router = Router();

router.get('/', (_req, res) => {
  const loans = LoanService.getAll();
  res.json(loans);
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const loan = LoanService.getById(id);
  if (!loan) {
    res.status(404).json({ error: '外借记录不存在' });
    return;
  }
  res.json(loan);
});

router.post('/validate', (req, res) => {
  const body = req.body as CreateLoanRequest;
  if (!body.institutionId || !body.exhibitIds?.length || !body.loanDate || !body.returnDate) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }
  const risks = detectRisksForLoan(body);
  res.json({ risks });
});

router.post('/', (req, res) => {
  const body = req.body as CreateLoanRequest;
  if (!body.institutionId || !body.exhibitIds?.length || !body.loanDate || !body.returnDate) {
    res.status(400).json({ error: '机构、展品、借出日期、归还日期为必填项' });
    return;
  }
  if (!body.contactPerson || !body.contactPhone) {
    res.status(400).json({ error: '联系人和联系电话为必填项' });
    return;
  }
  try {
    const result = LoanService.create(body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '创建外借记录失败' });
  }
});

router.put('/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status, actualReturnDate } = req.body as { status: LoanStatus; actualReturnDate?: string };
  if (!status) {
    res.status(400).json({ error: '状态为必填项' });
    return;
  }
  const loan = LoanService.updateStatus(id, status, actualReturnDate);
  if (!loan) {
    res.status(404).json({ error: '外借记录不存在' });
    return;
  }
  res.json(loan);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = LoanService.delete(id);
  if (!success) {
    res.status(404).json({ error: '外借记录不存在' });
    return;
  }
  res.json({ success: true });
});

export default router;
