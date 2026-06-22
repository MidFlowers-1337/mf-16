import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Package,
  Calendar,
  Truck,
  User,
  AlertTriangle,
  CheckCircle,
  ThermometerSun,
  Shield,
  Clock,
} from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../api/client';
import { cn, formatCurrency, transportMethodLabels } from '../lib/utils';
import type { RiskItem, CreateLoanRequest, TransportMethod } from '../../shared/types';

const steps = [
  { id: 1, title: '选择机构', icon: Building2 },
  { id: 2, title: '选择展品', icon: Package },
  { id: 3, title: '填写信息', icon: Calendar },
  { id: 4, title: '确认提交', icon: CheckCircle },
];

export default function NewLoan() {
  const navigate = useNavigate();
  const { exhibits, institutions, loadExhibits, loadLoans, loadRisks } = useAppStore();
  const [step, setStep] = useState(1);
  const [institutionId, setInstitutionId] = useState<number | ''>('');
  const [selectedExhibits, setSelectedExhibits] = useState<number[]>([]);
  const [loanDate, setLoanDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [transportMethod, setTransportMethod] = useState<TransportMethod>('standard');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const availableExhibits = exhibits.filter(e => e.status !== 'maintenance');
  const selectedInstitution = institutions.find(i => i.id === institutionId);
  const selectedExhibitObjs = exhibits.filter(e => selectedExhibits.includes(e.id));

  const validateRisks = useCallback(async () => {
    if (!institutionId || selectedExhibits.length === 0 || !loanDate || !returnDate) return;
    setValidating(true);
    try {
      const req: CreateLoanRequest = {
        institutionId: Number(institutionId),
        exhibitIds: selectedExhibits,
        loanDate,
        returnDate,
        transportMethod,
        contactPerson,
        contactPhone,
        notes,
      };
      const res = await api.loans.validate(req);
      setRisks(res.risks);
    } catch (err) {
      console.error(err);
    } finally {
      setValidating(false);
    }
  }, [institutionId, selectedExhibits, loanDate, returnDate, transportMethod, contactPerson, contactPhone, notes]);

  useEffect(() => {
    if (step === 4) {
      validateRisks();
    }
  }, [step, validateRisks]);

  const canNext = () => {
    if (step === 1) return institutionId !== '';
    if (step === 2) return selectedExhibits.length > 0;
    if (step === 3) return loanDate && returnDate && contactPerson && contactPhone && loanDate <= returnDate;
    return true;
  };

  const handleSubmit = async () => {
    if (!canNext()) return;
    setSubmitting(true);
    try {
      const req: CreateLoanRequest = {
        institutionId: Number(institutionId),
        exhibitIds: selectedExhibits,
        loanDate,
        returnDate,
        transportMethod,
        contactPerson,
        contactPhone,
        notes: notes || undefined,
      };
      await api.loans.create(req);
      await loadLoans();
      await loadExhibits();
      await loadRisks();
      navigate('/loans');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExhibit = (id: number) => {
    setSelectedExhibits(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const riskIcon = (type: string) => {
    switch (type) {
      case 'time_conflict': return Clock;
      case 'temp_control': return ThermometerSun;
      case 'insurance': return Shield;
      case 'overdue': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const riskColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-risk-high bg-red-50';
      case 'medium': return 'border-risk-medium bg-orange-50';
      case 'low': return 'border-risk-low bg-blue-50';
      default: return 'border-museum-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/loans" className="p-2 text-museum-600 hover:bg-museum-100 rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-museum-900">新建外借记录</h1>
            <p className="text-museum-600 mt-1">按步骤填写外借信息</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isPast = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isActive && 'bg-gold-500 text-museum-900 shadow-lg scale-110',
                    isPast && 'bg-museum-800 text-white',
                    !isActive && !isPast && 'bg-museum-100 text-museum-400'
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    'font-medium text-sm',
                    isActive ? 'text-museum-900' : isPast ? 'text-museum-700' : 'text-museum-400'
                  )}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-4',
                    isPast ? 'bg-museum-700' : 'bg-museum-100'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-museum-700 mb-2">选择借展机构</label>
              <div className="grid grid-cols-2 gap-3">
                {institutions.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => setInstitutionId(inst.id)}
                    className={cn(
                      'p-4 border-2 rounded-lg text-left transition-all',
                      institutionId === inst.id
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-museum-100 hover:border-museum-300 bg-white'
                    )}
                  >
                    <p className="font-serif font-semibold text-museum-900">{inst.name}</p>
                    <p className="text-xs text-museum-500 mt-1">联系人：{inst.contactPerson}</p>
                    <p className="text-xs text-museum-500">保险额度：{formatCurrency(inst.insuranceCoverage)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-museum-700">选择展品（已选 {selectedExhibits.length} 件）</label>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-auto pr-2">
                {availableExhibits.map(ex => {
                  const selected = selectedExhibits.includes(ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => toggleExhibit(ex.id)}
                      className={cn(
                        'p-4 border-2 rounded-lg text-left transition-all',
                        selected
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-museum-100 hover:border-museum-300 bg-white'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-serif font-semibold text-museum-900">{ex.name}</p>
                          <p className="text-xs text-museum-500 mt-1">{ex.category} · {formatCurrency(ex.insuranceValue)}</p>
                        </div>
                        {ex.requiresTemperatureControl && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            <ThermometerSun className="w-3 h-3" /> 恒温
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          ex.status === 'in_house' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {ex.status === 'in_house' ? '在馆' : '已借出（可能冲突）'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-museum-700 mb-1">借出日期 *</label>
                  <input
                    type="date"
                    value={loanDate}
                    onChange={e => setLoanDate(e.target.value)}
                    className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-museum-700 mb-1">归还日期 *</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-museum-700 mb-2">运输方式 *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['standard', 'temperature_controlled', 'special'] as TransportMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setTransportMethod(m)}
                      className={cn(
                        'p-3 border-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2',
                        transportMethod === m
                          ? 'border-gold-500 bg-gold-50 text-museum-900'
                          : 'border-museum-100 hover:border-museum-300 bg-white text-museum-700'
                      )}
                    >
                      <Truck className="w-4 h-4" />
                      {transportMethodLabels[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-museum-700 mb-1 flex items-center gap-1">
                    <User className="w-4 h-4" /> 借展联系人 *
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-museum-700 mb-1">联系电话 *</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">备注</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none"
                  placeholder="可选填其他说明..."
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-museum-900 mb-4">借展信息确认</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-museum-50 rounded-lg p-5">
                  <div>
                    <span className="text-museum-500 text-sm">借展机构：</span>
                    <span className="font-medium text-museum-900">{selectedInstitution?.name}</span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">机构保险额度：</span>
                    <span className="font-medium text-museum-900">{formatCurrency(selectedInstitution?.insuranceCoverage || 0)}</span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">展品清单：</span>
                    <span className="font-medium text-museum-900">{selectedExhibitObjs.map(e => e.name).join('、')}</span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">展品总估值：</span>
                    <span className="font-medium text-museum-900">
                      {formatCurrency(selectedExhibitObjs.reduce((s, e) => s + e.insuranceValue, 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">借展日期：</span>
                    <span className="font-medium text-museum-900">{loanDate} ~ {returnDate}</span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">运输方式：</span>
                    <span className="font-medium text-museum-900">{transportMethodLabels[transportMethod]}</span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">联系人：</span>
                    <span className="font-medium text-museum-900">{contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-museum-500 text-sm">联系电话：</span>
                    <span className="font-medium text-museum-900">{contactPhone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-museum-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-gold-600" /> 风险检测
                </h3>
                {validating ? (
                  <p className="text-museum-400 text-sm py-8 text-center">正在检测风险...</p>
                ) : risks.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    未检测到风险，可以安全提交
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-museum-600 mb-2">
                      检测到 <span className="font-semibold text-risk-high">{risks.length}</span> 项风险，仍可提交但请谨慎：
                    </p>
                    {risks.map(r => {
                      const Icon = riskIcon(r.type);
                      return (
                        <div key={r.id} className={cn('border-l-4 rounded-r-lg p-4 pl-4', riskColor(r.severity))}>
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-museum-900">{r.title}</p>
                              <p className="text-sm text-museum-600 mt-0.5">{r.description}</p>
                              <span className={cn(
                                'inline-block text-xs font-medium mt-2 px-2 py-0.5 rounded',
                                r.severity === 'high' ? 'bg-risk-high text-white'
                                  : r.severity === 'medium' ? 'bg-risk-medium text-white'
                                  : 'bg-risk-low text-white'
                              )}>
                                {r.severity === 'high' ? '高风险' : r.severity === 'medium' ? '中风险' : '低风险'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-museum-100">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-colors',
              step === 1
                ? 'text-museum-300 cursor-not-allowed'
                : 'text-museum-700 hover:bg-museum-100'
            )}
          >
            <ArrowLeft className="w-4 h-4" /> 上一步
          </button>

          {step < 4 ? (
            <button
              onClick={() => canNext() && setStep(step + 1)}
              disabled={!canNext()}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-md transition-colors',
                canNext()
                  ? 'bg-museum-800 text-white hover:bg-museum-700'
                  : 'bg-museum-200 text-museum-400 cursor-not-allowed'
              )}
            >
              下一步 <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-md transition-colors',
                submitting
                  ? 'bg-museum-400 text-white cursor-not-allowed'
                  : 'bg-gold-600 text-white hover:bg-gold-700'
              )}
            >
              {submitting ? '提交中...' : '确认提交外借'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
