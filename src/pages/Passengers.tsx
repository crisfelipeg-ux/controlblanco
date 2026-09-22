import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, UserCheck } from 'lucide-react';
import { Passenger, User } from '../types';

interface PassengersProps {
  passengers: Passenger[];
  currentUser: User;
  onSave: (passengers: Passenger[]) => void;
}

const emptyPassenger: Passenger = { id: '', firstName: '', lastName: '', idType: 'CC', idNumber: '', address: '', locality: '', phone: '', hasResponsible: false, responsibleName: '' };

const localities = ['Laureles', 'Belén', 'Robledo', 'Castilla', 'La América', 'El Poblado', 'Buenos Aires', 'San Javier', 'Manrique', 'Aranjuez', 'Centro', 'Guayabal', 'Popular', 'Villa Hermosa'];

export default function Passengers({ passengers, currentUser, onSave }: PassengersProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Passenger | null>(null);
  const [formData, setFormData] = useState<Passenger>(emptyPassenger);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetail, setShowDetail] = useState<Passenger | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = passengers.filter(p => `${p.firstName} ${p.lastName} ${p.idNumber}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.idNumber) return;
    let updated: Passenger[];
    if (editing) {
      updated = passengers.map(p => p.id === editing.id ? { ...formData, id: editing.id } : p);
    } else {
      updated = [...passengers, { ...formData, id: `p-${Date.now()}` }];
    }
    onSave(updated);
    setShowForm(false);
    setEditing(null);
    setFormData(emptyPassenger);
  };

  const canEdit = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios / Pasajeros</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de usuarios del servicio de transporte</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditing(null); setFormData(emptyPassenger); setShowForm(true); }} className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={18} /> Nuevo Usuario
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por nombre o identificación..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Identificación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Dirección</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Localidad</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Responsable</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-sm font-bold">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</div>
                      <span className="text-sm font-medium text-slate-700">{p.firstName} {p.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.idType} {p.idNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.address}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.locality}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.hasResponsible ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.responsibleName}</span> : <span className="text-xs text-slate-400">No</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setShowDetail(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600"><Eye size={16} /></button>
                      {canEdit && (
                        <>
                          <button onClick={() => { setEditing(p); setFormData(p); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Identificación</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value as Passenger['idType']})}>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Número de Identificación *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.locality} onChange={e => setFormData({...formData, locality: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {localities.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" className="rounded border-slate-300" checked={formData.hasResponsible} onChange={e => setFormData({...formData, hasResponsible: e.target.checked})} />
                  ¿Tiene responsable?
                </label>
              </div>
              {formData.hasResponsible && (
                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Responsable</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.responsibleName} onChange={e => setFormData({...formData, responsibleName: e.target.value})} /></div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Detalle del Usuario</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-lg font-bold">{showDetail.firstName.charAt(0)}{showDetail.lastName.charAt(0)}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{showDetail.firstName} {showDetail.lastName}</h3>
                  <p className="text-sm text-slate-500">{showDetail.idType} {showDetail.idNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Dirección:</span><br/><span className="font-medium">{showDetail.address}</span></div>
                <div><span className="text-slate-500">Localidad:</span><br/><span className="font-medium">{showDetail.locality}</span></div>
                <div><span className="text-slate-500">Teléfono:</span><br/><span className="font-medium">{showDetail.phone}</span></div>
                <div><span className="text-slate-500">Responsable:</span><br/><span className="font-medium">{showDetail.hasResponsible ? showDetail.responsibleName : 'No aplica'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-slate-600 mb-6">¿Está seguro que desea eliminar este usuario?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={() => { onSave(passengers.filter(p => p.id !== deleteConfirm)); setDeleteConfirm(null); }} className="px-4 py-2 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
