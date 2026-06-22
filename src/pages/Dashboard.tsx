import { Link } from 'react-router-dom';
import {
  Package,
  Building2,
  FileText,
  AlertTriangle,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const { exhibits, institutions, loans, risks, schedule } = useAppStore();

  const stats = [
    {
      label: '展品总数',
      value: exhibits.length,
      icon: Package,
      color: 'bg-museum-100 text-museum-800',
      link: '/exhibits',
      subtitle: `在馆 ${exhibits.filter(e => e.status === 'in_house').length} 件`,
    },
    {
      label: '借展机构',
      value: institutions.length,
      icon: Building2,
      color: 'bg-gold-100 text-gold-700',
      link: '/institutions',
      subtitle: `合作机构总数`,
    },
    {
      label: '外借记录',
      value: loans.length,
      icon: FileText,
      color: 'bg-blue-100 text-blue-700',
      link: '/loans',
      subtitle: `进行中 ${loans.filter(l => l.status === 'active' || l.status === 'pending').length} 条`,
    },
    {
      label: '待处理风险',
      value: risks.filter(r => !r.resolved).length,
      icon: AlertTriangle,
      color: 'bg-red-100 text-risk-high',
      link: '/risks',
      subtitle: `高风险 ${risks.filter(r => !r.resolved && r.severity === 'high').length} 项`,
    },
  ];

  const totalValue = exhibits.reduce((sum, e) => sum + e.insuranceValue, 0);
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const upcomingTransports = schedule.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-museum-900">系统概览</h1>
        <p className="text-museum-600 mt-1">欢迎使用博物馆展品外借管理系统</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <Link
            key={s.label}
            to={s.link}
            className="bg-white rounded-xl p-5 border border-museum-100 shadow-sm hover:shadow-md hover:border-gold-300 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-museum-500">{s.label}</p>
                <p className="text-3xl font-bold text-museum-900 mt-2 font-serif">{s.value}</p>
                <p className="text-xs text-museum-400 mt-1">{s.subtitle}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-end mt-4 text-gold-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              查看详情 <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-6 border border-museum-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-museum-900">藏品总览</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-museum-50 rounded-lg p-4">
              <p className="text-sm text-museum-500">全部展品保险估值</p>
              <p className="text-2xl font-bold text-museum-900 mt-2 font-serif">{formatCurrency(totalValue)}</p>
            </div>
            <div className="bg-museum-50 rounded-lg p-4">
              <p className="text-sm text-museum-500">当前外展品数量</p>
              <p className="text-2xl font-bold text-museum-900 mt-2 font-serif">{activeLoans.length}</p>
            </div>
          </div>

          <h3 className="font-serif font-semibold text-museum-800 mt-6 mb-3">展品类别分布</h3>
          <div className="space-y-2">
            {Array.from(new Set(exhibits.map(e => e.category))).map(cat => {
              const count = exhibits.filter(e => e.category === cat).length;
              const pct = (count / exhibits.length) * 100;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-museum-700">{cat}</span>
                    <span className="text-museum-500">{count} 件</span>
                  </div>
                  <div className="h-2 bg-museum-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-museum-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-museum-900">近期运输</h2>
            <Link to="/transport" className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1">
              <Truck className="w-4 h-4" /> 全部
            </Link>
          </div>
          {upcomingTransports.length === 0 ? (
            <p className="text-museum-400 text-sm py-8 text-center">暂无近期运输安排</p>
          ) : (
            <div className="space-y-3">
              {upcomingTransports.map((t, i) => (
                <div key={i} className="border-l-4 border-museum-200 pl-3 py-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      t.type === 'outbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {t.type === 'outbound' ? '发出' : '归还'}
                    </span>
                    <span className="text-xs text-museum-500">{t.date}</span>
                  </div>
                  <p className="text-sm font-medium text-museum-800 mt-1">{t.institutionName}</p>
                  <p className="text-xs text-museum-500 mt-0.5">
                    {t.exhibits.map(e => e.name).join('、')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
