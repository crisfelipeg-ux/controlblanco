import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, UserCheck, Building2, DollarSign, ClipboardList, Calendar, AlertTriangle, FileText, Bell, Search, Menu, X, LogOut, ChevronDown, Settings } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  alertCount: number;
  users: User[];
}

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'operador', 'consulta'] },
  { path: '/drivers', icon: Users, label: 'Conductores', roles: ['admin', 'operador', 'consulta'] },
  { path: '/vehicles', icon: Truck, label: 'Vehículos', roles: ['admin', 'operador', 'consulta'] },
  { path: '/passengers', icon: UserCheck, label: 'Usuarios', roles: ['admin', 'operador', 'consulta'] },
  { path: '/companies', icon: Building2, label: 'Empresas', roles: ['admin', 'operador', 'consulta'] },
  { path: '/rates', icon: DollarSign, label: 'Tarifas', roles: ['admin', 'operador', 'consulta'] },
  { path: '/services', icon: ClipboardList, label: 'Servicios', roles: ['admin', 'operador', 'consulta'] },
  { path: '/scheduling', icon: Calendar, label: 'Programación', roles: ['admin', 'operador'] },
  { path: '/alerts', icon: AlertTriangle, label: 'Alertas', roles: ['admin', 'operador', 'consulta'] },
  { path: '/audit', icon: FileText, label: 'Auditoría', roles: ['admin'] },
];

export default function Layout({ children, currentUser, onSwitchUser, alertCount, users }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-primary-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-lg">
              TG
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold whitespace-nowrap">TransGestión Pro</h1>
                <p className="text-xs text-slate-400 whitespace-nowrap">Gestión de Traslados</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar toggle */}
        <div className="hidden lg:block p-2 border-t border-white/10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <Menu size={20} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu size={20} />
            </button>
            
            {/* Search */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2 w-80">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar servicios, usuarios, vehículos..."
                className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-700 placeholder-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alerts */}
            <button onClick={() => navigate('/alerts')} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                </div>
                <ChevronDown size={16} className="text-slate-400 hidden md:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-700">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full capitalize font-medium">{currentUser.role}</span>
                  </div>
                  <div className="py-1">
                    <p className="px-4 py-1.5 text-xs text-slate-400 font-medium uppercase">Cambiar usuario (demo)</p>
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { onSwitchUser(u); setUserMenuOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${u.id === currentUser.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${u.id === currentUser.id ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {u.name.charAt(0)}
                        </div>
                        {u.name} <span className="text-xs text-slate-400 capitalize">({u.role})</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                      <Settings size={16} /> Configuración
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-danger-500 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={16} /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
