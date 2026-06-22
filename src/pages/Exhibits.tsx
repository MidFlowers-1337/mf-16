import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ThermometerSun } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../api/client';
import { cn, exhibitStatusLabels, formatCurrency } from '../lib/utils';
import type { Exhibit, ExhibitStatus } from '../../shared/types';

export default function Exhibits() {
  const { exhibits, loadExhibits } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<ExhibitStatus | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Exhibit | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    insuranceValue: 0,
    requiresTemperatureControl: false,
    status: 'in_house' as ExhibitStatus,
  });

  const categories = Array.from(new Set(exhibits.map(e => e.category)));
  const filtered = exhibits.filter(e => {
    if (search && !e.name.includes(search)) return false;
    if (filterCategory && e.category !== filterCategory) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    return true;
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', category: '', insuranceValue: 0, requiresTemperatureControl: false, status: 'in_house' });
    setShowModal(true);
  };

  const openEdit = (e: Exhibit) => {
    setEditing(e);
    setForm({
      name: e.name,
      category: e.category,
      insuranceValue: e.insuranceValue,
      requiresTemperatureControl: e.requiresTemperatureControl,
      status: e.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.exhibits.update(editing.id, form);
      } else {
        await api.exhibits.create(form);
      }
      await loadExhibits();
      setShowModal(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该展品吗？')) return;
    try {
      await api.exhibits.remove(id);
      await loadExhibits();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const statusColor = (status: ExhibitStatus) => {
    switch (status) {
      case 'in_house': return 'bg-green-100 text-green-700';
      case 'on_loan': return 'bg-amber-100 text-amber-700';
      case 'maintenance': return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-museum-900">展品管理</h1>
          <p className="text-museum-600 mt-1">管理博物馆所有展品信息</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-museum-800 text-white px-4 py-2 rounded-md hover:bg-museum-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新增展品
        </button>
      </div>

      <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-4 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-museum-400" />
          <input
            type="text"
            placeholder="搜索展品名称..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-2 py-1 border-b border-museum-200 focus:border-gold-500 outline-none bg-transparent text-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 border border-museum-200 rounded-md text-sm bg-white"
        >
          <option value="">全部类别</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as ExhibitStatus | '')}
          className="px-3 py-1.5 border border-museum-200 rounded-md text-sm bg-white"
        >
          <option value="">全部状态</option>
          <option value="in_house">在馆</option>
          <option value="on_loan">已借出</option>
          <option value="maintenance">维护中</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-museum-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-museum-50 border-b border-museum-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-museum-600 uppercase tracking-wider">展品名称</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-museum-600 uppercase tracking-wider">类别</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-museum-600 uppercase tracking-wider">保险估值</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-museum-600 uppercase tracking-wider">运输要求</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-museum-600 uppercase tracking-wider">状态</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-museum-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-museum-50">
            {filtered.map(exhibit => (
              <tr key={exhibit.id} className="hover:bg-museum-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-museum-900">{exhibit.name}</span>
                </td>
                <td className="px-6 py-4 text-museum-700">{exhibit.category}</td>
                <td className="px-6 py-4 text-museum-700">{formatCurrency(exhibit.insuranceValue)}</td>
                <td className="px-6 py-4">
                  {exhibit.requiresTemperatureControl ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <ThermometerSun className="w-3 h-3" /> 需恒温
                    </span>
                  ) : (
                    <span className="text-xs text-museum-400">普通</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', statusColor(exhibit.status))}>
                    {exhibitStatusLabels[exhibit.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(exhibit)} className="p-1.5 text-museum-500 hover:text-museum-800 hover:bg-museum-100 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(exhibit.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-museum-400">暂无展品数据</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-museum-900 mb-6">
              {editing ? '编辑展品' : '新增展品'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">展品名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  placeholder="如：商代青铜鼎"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">类别 *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  placeholder="如：青铜器、书画、陶瓷"
                  list="category-list"
                />
                <datalist id="category-list">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">保险估值（元）</label>
                <input
                  type="number"
                  value={form.insuranceValue}
                  onChange={e => setForm({ ...form, insuranceValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requiresTemperatureControl}
                    onChange={e => setForm({ ...form, requiresTemperatureControl: e.target.checked })}
                    className="w-4 h-4 text-gold-600"
                  />
                  <span className="text-sm text-museum-700">需要恒温运输</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">当前状态</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as ExhibitStatus })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none bg-white"
                >
                  <option value="in_house">在馆</option>
                  <option value="on_loan">已借出</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-museum-200 text-museum-700 rounded-md hover:bg-museum-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-museum-800 text-white rounded-md hover:bg-museum-700 transition-colors"
              >
                {editing ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
