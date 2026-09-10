import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  ArrowRightLeft,
  Clock,
  CircleDollarSign,
  BarChart3,
  Users,
  CreditCard,
  BookMarked
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, isLibrarian, isAdmin } = useAuth();

  const navItems = [
    { id: 'catalog', label: 'Book Catalog', icon: BookOpen, roles: ['member', 'librarian', 'admin'] },
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard, roles: ['member'] },
    { id: 'issues_returns', label: 'Issue & Return', icon: ArrowRightLeft, roles: ['librarian', 'admin'] },
    { id: 'holds', label: 'Hold Queue', icon: Clock, roles: ['member', 'librarian', 'admin'] },
    { id: 'fines', label: 'Fines & Payments', icon: CircleDollarSign, roles: ['member', 'librarian', 'admin'] },
    { id: 'reports', label: 'Reports & Inventory', icon: BarChart3, roles: ['librarian', 'admin'] },
    { id: 'users', label: 'User Admin', icon: Users, roles: ['admin'] },
    { id: 'memberships', label: 'Membership Plans', icon: CreditCard, roles: ['member', 'librarian', 'admin'] },
  ];

  const userRole = user?.role || 'member';
  const availableItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {availableItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {user && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1.5">
          <div className="text-slate-500 font-medium">Logged in as</div>
          <div className="font-semibold text-slate-900 truncate">{user.email}</div>
          {user.membershipId && (
            <div className="text-slate-500 font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200 inline-block">
              {user.membershipId}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
