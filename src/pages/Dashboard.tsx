import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { ClipboardList, Users, Truck, AlertTriangle, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Service, Driver, Vehicle, Alert } from '../types';

interface DashboardProps {
  services: Service[];
  drivers: Driver[];
  vehicles: Vehicle[];
  alerts: Alert[];
  companies: { id: string; name: string }[];
}

export default function Dashboard({ services, drivers, vehicles, alerts, companies }: DashboardProps) {
  const statusCounts = {
    generated: services.filter(s => s.status === 'GENERADO').length,
    scheduled: services.filter(s => s.status === 'PROGRAMADO').length,
    inProgress: services.filter(s => s.status === 'EN PROCESO').length,
    completed: services.filter(s => s.status === 'TERMINADO').length,
    failedWithCharge: services.filter(s => s.status === 'FALLIDO CON COBRO').length,
    failedNoCharge: services.filter(s => s.status === 'FALLIDO SIN COBRO').length,
  };

  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  const activeVehicles = vehicles.filter(v => v.status === 'available' || v.status === 'assigned').length;
  const dangerAlerts = alerts.filter(a => a.type === 'danger').length;
  const warningAlerts = alerts.filter(a => a.type === 'warning').length;
  const totalRevenue = services.filter(s => s.status === 'TERMINADO').reduce((sum, s) => sum + s.totalValue, 0);

  const statusData = [
    { name: 'Generado', value: statusCounts.generated, color: '#94a3b8' },
    { name: 'Programado', value: statusCounts.scheduled, color: '#3b82f6' },
    { name: 'En Proceso', value: statusCounts.inProgress, color: '#f59e0b' },
    { name: 'Terminado', value: statusCounts.completed, color: '#22c55e' },
    { name: 'Fallido (C)', value: statusCounts.failedWithCharge, color: '#f97316' },
    { name: 'Fallido (SC)', value: statusCounts.failedNoCharge, color: '#ef4444' },
  ];

  const companyData = companies.map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    servicios: services.filter(s => s.companyId === c.id).length,
    valor: services.filter(s => s.companyId === c.id).reduce((sum, s) => sum + s.totalValue, 0) / 1000,
  }));

  const weeklyData = [
    { dia: 'Lun', servicios: 12, valor: 540 },
    { dia: 'Mar', servicios: 18, valor: 810 },
    { dia: 'Mié', servicios: 15, valor: 675 },
    { dia: 'Jue', services: 22, valor: 990 },
    { dia: 'Vie', servicios: 20, valor: 900 },
    { dia: 'Sáb', servicios: 8, valor: 360 },
    { dia: 'Dom', servicios: 5, valor: 225 },
  ];

  const kpis = [
    { label: 'Servicios Totales', value: services.length, icon: ClipboardList, color: 'bg-primary-500', change: '+12%' },
    { label: 'En Proceso', value: statusCounts.inProgress, icon: Activity, color: 'bg-warning-500', change: '+3%' },
    { label: 'Completados', value: statusCounts.completed, icon: CheckCircle, color: 'bg-success-500', change: '+8%' },
    { label: 'Conductores Activos', value: activeDrivers, icon: Users, color: 'bg-indigo-500', change: '' },
    { label: 'Vehículos Activos', value: activeVehicles, icon: Truck, color: 'bg-teal-500', change: '' },
    { label: 'Ingresos (Terminados)', value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-emerald-500', change: '+15%' },
    { label: 'Alertas Críticas', value: dangerAlerts, icon: XCircle, color: 'bg-danger-500', change: '' },
    { label: 'Alertas Preventivas', value: warningAlerts, icon: AlertTriangle, color: 'bg-amber-500', change: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Resumen general del sistema de gestión de traslados</p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2 text-sm text-slate-500">
          <Clock size={16} />
          <span>Última actualización: {new Date().toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
                  {kpi.change && (
                    <span className="text-xs text-success-600 font-medium flex items-center gap-1 mt-1">
                      <TrendingUp size={12} /> {kpi.change}
                    </span>
                  )}
                </div>
                <div className={`${kpi.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services by Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Servicios por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, 'Servicios']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Services */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Servicios por Día (Semana actual)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="servicios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services by Company */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Servicios por Empresa Contratante</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={companyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="servicios" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Tendencia de Ingresos (Miles COP)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Services */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Servicios Recientes</h3>
          <div className="space-y-3">
            {services.slice(-5).reverse().map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-700">{service.serviceNumber}</p>
                  <p className="text-xs text-slate-500">{service.createdAt}</p>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Alertas Recientes</h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.type === 'danger' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                <AlertTriangle size={16} className={alert.type === 'danger' ? 'text-danger-500 mt-0.5' : 'text-warning-500 mt-0.5'} />
                <div>
                  <p className="text-sm font-medium text-slate-700">{alert.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No hay alertas activas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'GENERADO': 'bg-slate-100 text-slate-700',
    'PROGRAMADO': 'bg-blue-100 text-blue-700',
    'EN PROCESO': 'bg-amber-100 text-amber-700',
    'TERMINADO': 'bg-green-100 text-green-700',
    'FALLIDO CON COBRO': 'bg-orange-100 text-orange-700',
    'FALLIDO SIN COBRO': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}
