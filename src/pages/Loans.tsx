import { Link } from 'react-router-dom';
import { Plus, Calendar, Phone, Trash2, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../api/client';
import { cn, loanStatusLabels, formatDate, transportMethodLabels } from '../lib/utils';
import type { LoanStatus } from '../../shared/types';

export default function Loans() {
  const { loans, loadLoans, loadExhibits, loadRisks } = useAppStore();

  const handleMarkReturned = async (id: number) => {
    if (!confirm('确定标记该外借记录为已归还吗？')) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.loans.updateStatus(id, 'returned', today);
      await loadLoans();
      await loadExhibits();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该外借记录吗？关联的展品状态会被更新。')) return;
    try {
      await api.loans.remove(id);
      await loadLoans();
      await loadExhibits();
      await loadRisks();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const statusColor = (status: LoanStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'returned': return 'bg-gray-100 text-gray-600';
      case 'overdue': return 'bg-red-100 text-risk-high';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-museum-900">外借记录</h1>
          <p className="text-museum-600 mt-1">管理所有展品外借记录</p>
        </div>
        <Link
          to="/loans/new"
          className="flex items-center gap-2 bg-museum-800 text-white px-4 py-2 rounded-md hover:bg-museum-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新建外借
        </Link>
      </div>

      <div className="space-y-4">
        {loans.map(loan => (
          <div key={loan.id} className="bg-white rounded-xl border border-museum-100 shadow-sm p-5 hover:border-gold-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-serif text-lg font-semibold text-museum-900">
                    借展至：{loan.institutionName}
                  </h3>
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', statusColor(loan.status))}>
                    {loanStatusLabels[loan.status]}
                  </span>
                  <span className="text-xs text-museum-400">#{loan.id}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-museum-400 text-xs mb-1">展品清单</p>
                    <p className="text-museum-700">{loan.exhibits?.map(e => e.name).join('、')}</p>
                  </div>
                  <div>
                    <p className="text-museum-400 text-xs mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> 借展日期
                    </p>
                    <p className="text-museum-700">
                      {formatDate(loan.loanDate)} ~ {formatDate(loan.returnDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-museum-400 text-xs mb-1">运输方式</p>
                    <p className="text-museum-700">{transportMethodLabels[loan.transportMethod]}</p>
                  </div>
                  <div>
                    <p className="text-museum-400 text-xs mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> 联系人
                    </p>
                    <p className="text-museum-700">{loan.contactPerson} · {loan.contactPhone}</p>
                  </div>
                </div>
                {loan.notes && (
                  <p className="text-xs text-museum-500 mt-3 bg-museum-50 px-3 py-2 rounded">
                    备注：{loan.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {(loan.status === 'active' || loan.status === 'overdue' || loan.status === 'pending') && (
                  <button
                    onClick={() => handleMarkReturned(loan.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> 标记归还
                  </button>
                )}
                <button
                  onClick={() => handleDelete(loan.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loans.length === 0 && (
        <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-12 text-center">
          <p className="text-museum-400 mb-4">暂无外借记录</p>
          <Link
            to="/loans/new"
            className="inline-flex items-center gap-2 bg-museum-800 text-white px-4 py-2 rounded-md hover:bg-museum-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> 创建第一条外借记录
          </Link>
        </div>
      )}
    </div>
  );
}
