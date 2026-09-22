import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, Building2 } from 'lucide-react';
import { ContractingCompany, User } from '../types';

interface CompaniesProps {
  companies: ContractingCompany[];
  currentUser: User;
  onSave: (companies: ContractingCompany[]) => void;
}

const emptyCompany: ContractingCompany = { id: '', name: '', idType: 'NIT', idNumber: '', address: '', phone: '', contractObject: '', contractNumber: '' };
const contractObjects = ['Transporte escolar', 'Transporte de usuarios de la salud', 'Turismo', 'Transporte empresarial', 'Grupo específico de usuarios'];

export default function Companies({ companies, currentUser, onSave }: CompaniesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContractingCompany | null>(null);
  const [formData, setFormData] = useState<ContractingCompany>(emptyCompany);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState<ContractingCompany | null>(null);

  const filtered = companies.filter(c => `${c.name} ${c.idNumber} ${c.contractObject}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (!formData.name || !formData.idNumber) return;
    let updated: ContractingCompany[];
    if (editing) {
      updated = companies.map(c => c.id === editing.id ? { ...formData, id: editing.id } : c);
    } else {
      updated = [...companies, { ...formData, id: `c-${Date.now()}` }];
    }
    onSave(updated);
    setShowForm(false);
    setEditing(null);
    setFormData(emptyCompany);
  };

  const canEdit = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Empresas Contratantes</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de empresas y entidades contratantes</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditing(null); setFormData(emptyCompany); setShowForm(true); }} className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={18} /> Nueva Empresa
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar empresa..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(company => (
          <div key={company.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{company.name}</h3>
                  <p className="text-xs text-slate-500">{company.idType} {company.idNumber}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setShowDetail(company)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600"><Eye size={14} /></button>
                {canEdit && (
                  <>
                    <button onClick={() => { setEditing(company); setFormData(company); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                    <button onClick={() => onSave(companies.filter(c => c.id !== company.id))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="text-slate-400 text-xs">Contrato:</span><span className="font-medium text-slate-700">{company.contractNumber}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400 text-xs">Objeto:</span><span className="font-medium text-slate-700">{company.contractObject}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-400 text-xs">Teléfono:</span><span className="font-medium text-slate-700">{company.phone}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Razón Social *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Identificación</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                  <option value="NIT">NIT</option>
                  <option value="CC">Cédula</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Número de Identificación *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">N° de Contrato</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.contractNumber} onChange={e => setFormData({...formData, contractNumber: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Objeto del Contrato</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.contractObject} onChange={e => setFormData({...formData, contractObject: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {contractObjects.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Detalle de Empresa</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center"><Building2 size={24} className="text-indigo-600" /></div>
                <div><h3 className="font-bold text-slate-800">{showDetail.name}</h3><p className="text-slate-500">{showDetail.idType} {showDetail.idNumber}</p></div>
              </div>
              <p><span className="text-slate-500">Dirección:</span> <span className="font-medium">{showDetail.address}</span></p>
              <p><span className="text-slate-500">Teléfono:</span> <span className="font-medium">{showDetail.phone}</span></p>
              <p><span className="text-slate-500">Contrato:</span> <span className="font-medium">{showDetail.contractNumber}</span></p>
              <p><span className="text-slate-500">Objeto:</span> <span className="font-medium">{showDetail.contractObject}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
