import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, DollarSign } from 'lucide-react';
import { Rate, ContractingCompany, User } from '../types';
import { municipalities } from '../store';

interface RatesProps {
  rates: Rate[];
  companies: ContractingCompany[];
  currentUser: User;
  onSave: (rates: Rate[]) => void;
}

const emptyRate: Rate = { id: '', companyId: '', transferType: 'sencillo', municipality: '', value: 0 };

export default function Rates({ rates, companies, currentUser, onSave }: RatesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Rate | null>(null);
  const [formData, setFormData] = useState<Rate>(emptyRate);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'N/A';

  const filtered = rates.filter(r => {
    const matchSearch = `${getCompanyName(r.companyId)} ${r.municipality}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCompany = filterCompany === 'all' || r.companyId === filterCompany;
    const matchType = filterType === 'all' || r.transferType === filterType;
    return matchSearch && matchCompany && matchType;
  });

  const handleSave = () => {
    if (!formData.companyId || !formData.municipality || !formData.value) return;
    let updated: Rate[];
    if (editing) {
      updated = rates.map(r => r.id === editing.id ? { ...formData, id: editing.id } : r);
    } else {
      updated = [...rates, { ...formData, id: `r-${Date.now()}` }];
    }
    onSave(updated);
    setShowForm(false);
    setEditing(null);
    setFormData(emptyRate);
  };

  const canEdit = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tarifas</h1>
          <p className="text-slate-500 text-sm mt-1">Administración de tarifas por empresa, municipio y tipo de traslado</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditing(null); setFormData(emptyRate); setShowForm(true); }} className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={18} /> Nueva Tarifa
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Tarifas</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{rates.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Tarifa Mínima</p>
          <p className="text-2xl font-bold text-green-700 mt-1">${Math.min(...rates.map(r => r.value)).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Tarifa Máxima</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">${Math.max(...rates.map(r => r.value)).toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por empresa o municipio..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
            <option value="all">Todas las empresas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="sencillo">Sencillo</option>
            <option value="doble">Doble</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Municipio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Tipo de Traslado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Valor</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(rate => (
                <tr key={rate.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{getCompanyName(rate.companyId)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{rate.municipality}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${rate.transferType === 'sencillo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {rate.transferType === 'sencillo' ? 'Sencillo' : 'Doble'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">${rate.value.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {canEdit && (
                        <>
                          <button onClick={() => { setEditing(rate); setFormData(rate); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => onSave(rates.filter(r => r.id !== rate.id))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Editar Tarifa' : 'Nueva Tarifa'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Empresa Contratante *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}>
                  <option value="">Seleccionar empresa...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Municipio *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.municipality} onChange={e => setFormData({...formData, municipality: e.target.value})}>
                  <option value="">Seleccionar municipio...</option>
                  {municipalities.map(m => <option key={m.code} value={m.name}>{m.name} - {m.department}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Traslado *</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.transferType} onChange={e => setFormData({...formData, transferType: e.target.value as 'sencillo' | 'doble'})}>
                  <option value="sencillo">Sencillo</option>
                  <option value="doble">Doble</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Valor del Recorrido (COP) *</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.value} onChange={e => setFormData({...formData, value: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
