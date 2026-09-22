import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Bell, Filter, Clock, Shield } from 'lucide-react';
import { Alert, AuditLog } from '../types';

interface AlertsPageProps {
  alerts: Alert[];
}

export function AlertsPage({ alerts }: AlertsPageProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = alerts.filter(a => filterType === 'all' || a.type === filterType);
  const dangerCount = alerts.filter(a => a.type === 'danger').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Centro de Alertas</h1>
        <p className="text-slate-500 text-sm mt-1">Documentación próxima a vencer y estados críticos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"><XCircle size={24} className="text-danger-500" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Críticas</p><p className="text-2xl font-bold text-danger-500">{dangerCount}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><AlertTriangle size={24} className="text-warning-500" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Preventivas</p><p className="text-2xl font-bold text-warning-500">{warningCount}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><Bell size={24} className="text-slate-600" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Total</p><p className="text-2xl font-bold text-slate-800">{alerts.length}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex gap-3">
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Todas las alertas</option>
            <option value="danger">Críticas</option>
            <option value="warning">Preventivas</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(alert => (
          <div key={alert.id} className={`bg-white rounded-xl p-4 border shadow-sm ${alert.type === 'danger' ? 'border-red-200' : 'border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.type === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
                {alert.type === 'danger' ? <XCircle size={20} className="text-danger-500" /> : <AlertTriangle size={20} className="text-warning-500" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">{alert.title}</h4>
                <p className="text-sm text-slate-600 mt-0.5">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12} /> Vence: {alert.expiryDate}</span>
                  {alert.daysRemaining > 0 && <span className="text-xs text-amber-600 font-medium">{alert.daysRemaining} días restantes</span>}
                  {alert.daysRemaining === 0 && <span className="text-xs text-red-600 font-medium">VENCIDO</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.entity === 'driver' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {alert.entity === 'driver' ? 'Conductor' : 'Vehículo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay alertas activas</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AuditPageProps {
  auditLogs: AuditLog[];
}

export function AuditPage({ auditLogs }: AuditPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Historial de Auditoría</h1>
        <p className="text-slate-500 text-sm mt-1">Registro de todas las operaciones realizadas en el sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Fecha/Hora</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Entidad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">ID Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">{log.date} {log.time}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{log.userName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.action}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{log.entity}</span></td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono">{log.entityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {auditLogs.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Shield size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay registros de auditoría</p>
          </div>
        )}
      </div>
    </div>
  );
}
