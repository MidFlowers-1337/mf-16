import { useState } from 'react';
import {
  AlertTriangle,
  ThermometerSun,
  Shield,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useAppStore } from '../store';
import { cn, formatDate, riskSeverityLabels, riskTypeLabels } from '../lib/utils';
import type { RiskSeverity } from '../../shared/types';

export default function Risks() {
  const { risks, resolveRisk, loadRisks } = useAppStore();
  const [filterSeverity, setFilterSeverity] = useState<RiskSeverity | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);

  const filtered = risks.filter(r => {
    if (!showResolved && r.resolved) return false;
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    return true;
  });

  const handleResolve = async (id: string) => {
    try {
      await resolveRisk(id);
      await loadRisks();
    } catch (err) {
      alert((err as Error).message);
    }
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

  const severityStyles = (severity: string) => {
    switch (severity) {
      case 'high': return {
        border: 'border-l-risk-high',
        badge: 'bg-risk-high text-white',
        dot: 'bg-risk-high',
      };
      case 'medium': return {
        border: 'border-l-risk-medium',
        badge: 'bg-risk-medium text-white',
        dot: 'bg-risk-medium',
      };
      case 'low': return {
        border: 'border-l-risk-low',
        badge: 'bg-risk-low text-white',
        dot: 'bg-risk-low',
      };
      default: return { border: 'border-l-museum-300', badge: 'bg-museum-500 text-white', dot: 'bg-museum-500' };
    }
  };

  const unresolvedCount = risks.filter(r => !r.resolved).length;
  const highCount = risks.filter(r => !r.resolved && r.severity === 'high').length;
  const mediumCount = risks.filter(r => !r.resolved && r.severity === 'medium').length;
  const lowCount = risks.filter(r => !r.resolved && r.severity === 'low').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-museum-900">风险中心</h1>
          <p className="text-museum-600 mt-1">集中管理和处理各类风险提醒</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-museum-100 shadow-sm">
          <p className="text-sm text-museum-500">待处理风险</p>
          <p className="text-3xl font-bold text-museum-900 mt-2 font-serif">{unresolvedCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-museum-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-risk-high" />
            <p className="text-sm text-museum-500">高风险</p>
          </div>
          <p className="text-3xl font-bold text-risk-high mt-2 font-serif">{highCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-museum-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-risk-medium" />
            <p className="text-sm text-museum-500">中风险</p>
          </div>
          <p className="text-3xl font-bold text-risk-medium mt-2 font-serif">{mediumCount}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-museum-100 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-risk-low" />
            <p className="text-sm text-museum-500">低风险</p>
          </div>
          <p className="text-3xl font-bold text-risk-low mt-2 font-serif">{lowCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-museum-400" />
          <span className="text-sm text-museum-600">严重程度：</span>
        </div>
        {(['all', 'high', 'medium', 'low'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterSeverity(s)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              filterSeverity === s
                ? 'bg-museum-800 text-white'
                : 'bg-museum-50 text-museum-600 hover:bg-museum-100'
            )}
          >
            {s === 'all' ? '全部' : riskSeverityLabels[s]}
          </button>
        ))}
        <div className="flex-1" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={e => setShowResolved(e.target.checked)}
            className="w-4 h-4 text-gold-600"
          />
          <span className="text-sm text-museum-600">显示已处理</span>
        </label>
      </div>

      <div className="space-y-3">
        {filtered.map(r => {
          const Icon = riskIcon(r.type);
          const styles = severityStyles(r.severity);
          return (
            <div
              key={r.id}
              className={cn(
                'bg-white rounded-xl border border-museum-100 shadow-sm border-l-4 p-5 transition-all',
                styles.border,
                r.resolved && 'opacity-60'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  r.resolved ? 'bg-museum-100 text-museum-400' : 'bg-museum-50 text-museum-700'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif font-semibold text-museum-900">
                      {r.title}
                    </h3>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      styles.badge
                    )}>
                      {riskSeverityLabels[r.severity]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-museum-100 text-museum-600">
                      {riskTypeLabels[r.type]}
                    </span>
                    {r.resolved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 已处理
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-museum-600">{r.description}</p>
                  {r.exhibitName && (
                    <p className="text-xs text-museum-400 mt-2">
                      关联展品：{r.exhibitName}
                      {r.loanId && ` · 外借记录 #${r.loanId}`}
                    </p>
                  )}
                  <p className="text-xs text-museum-400 mt-1">
                    产生时间：{formatDate(r.createdAt)}
                  </p>
                </div>
                {!r.resolved && (
                  <button
                    onClick={() => handleResolve(r.id)}
                    className="px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 标记已处理
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-16 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-lg font-serif text-museum-700">
            {showResolved ? '暂无风险记录' : '当前没有待处理的风险 🎉'}
          </p>
          <p className="text-sm text-museum-400 mt-2">
            {showResolved ? '系统尚未检测到任何风险' : '所有风险都已妥善处理'}
          </p>
        </div>
      )}
    </div>
  );
}
