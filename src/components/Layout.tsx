import { NavLink, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Building2,
  FileText,
  AlertTriangle,
  Truck,
  Archive,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';
import { useEffect } from 'react';

const navItems = [
  { to: '/', label: '系统概览', icon: LayoutDashboard, end: true },
  { to: '/exhibits', label: '展品管理', icon: Package },
  { to: '/institutions', label: '借展机构', icon: Building2 },
  { to: '/loans', label: '外借记录', icon: FileText },
  { to: '/risks', label: '风险中心', icon: AlertTriangle },
  { to: '/transport', label: '运输安排', icon: Truck },
];

export default function Layout() {
  const location = useLocation();
  const loadAll = useAppStore(s => s.loadAll);
  const risks = useAppStore(s => s.risks);
  const unresolvedRisks = risks.filter(r => !r.resolved).length;

  useEffect(() => {
    loadAll();
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-museum-50">
      <aside className="w-60 bg-museum-800 text-museum-100 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-museum-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500 flex items-center justify-center">
              <Archive className="w-6 h-6 text-museum-900" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-gold-100">展品外借系统</h1>
              <p className="text-xs text-museum-300">博物馆管理</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gold-500 text-museum-900 shadow-sm'
                    : 'text-museum-200 hover:bg-museum-700 hover:text-museum-50'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/risks' && unresolvedRisks > 0 && (
                <span className="bg-risk-high text-white text-xs px-2 py-0.5 rounded-full">
                  {unresolvedRisks}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-museum-700 text-xs text-museum-400">
          <p>数据存储于本地 SQLite</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8 overflow-auto"><Outlet /></div>
      </main>
    </div>
  );
}
