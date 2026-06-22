import { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, User, Shield } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../api/client';
import { formatCurrency } from '../lib/utils';
import type { Institution } from '../../shared/types';

export default function Institutions() {
  const { institutions, loadInstitutions } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Institution | null>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    contactPhone: '',
    insuranceCoverage: 0,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', contactPerson: '', contactPhone: '', insuranceCoverage: 0 });
    setShowModal(true);
  };

  const openEdit = (i: Institution) => {
    setEditing(i);
    setForm({
      name: i.name,
      contactPerson: i.contactPerson,
      contactPhone: i.contactPhone,
      insuranceCoverage: i.insuranceCoverage,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.institutions.update(editing.id, form);
      } else {
        await api.institutions.create(form);
      }
      await loadInstitutions();
      setShowModal(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该机构吗？')) return;
    try {
      await api.institutions.remove(id);
      await loadInstitutions();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-museum-900">借展机构</h1>
          <p className="text-museum-600 mt-1">管理合作的借展机构信息</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-museum-800 text-white px-4 py-2 rounded-md hover:bg-museum-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新增机构
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {institutions.map(inst => (
          <div key={inst.id} className="bg-white rounded-xl border border-museum-100 shadow-sm p-5 hover:border-gold-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-museum-900">{inst.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(inst)} className="p-1.5 text-museum-500 hover:text-museum-800 hover:bg-museum-100 rounded transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(inst.id)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-museum-600">
                <User className="w-4 h-4 text-museum-400" />
                <span>联系人：{inst.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-museum-600">
                <Phone className="w-4 h-4 text-museum-400" />
                <span>联系电话：{inst.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-museum-600">
                <Shield className="w-4 h-4 text-museum-400" />
                <span>可承担保险额度：<span className="font-medium text-museum-800">{formatCurrency(inst.insuranceCoverage)}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {institutions.length === 0 && (
        <div className="bg-white rounded-xl border border-museum-100 shadow-sm p-12 text-center text-museum-400">
          暂无机构数据
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-museum-900 mb-6">
              {editing ? '编辑机构' : '新增机构'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">机构名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">联系人 *</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">联系电话 *</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-museum-700 mb-1">可承担保险额度（元）</label>
                <input
                  type="number"
                  value={form.insuranceCoverage}
                  onChange={e => setForm({ ...form, insuranceCoverage: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-museum-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
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
