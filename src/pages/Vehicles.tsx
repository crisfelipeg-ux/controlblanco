import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, AlertTriangle, CheckCircle, XCircle, X, Truck } from 'lucide-react';
import { Vehicle, User } from '../types';

interface VehiclesProps {
  vehicles: Vehicle[];
  currentUser: User;
  onSave: (vehicles: Vehicle[]) => void;
}

const emptyVehicle: Vehicle = {
  id: '', plate: '', brand: '', model: '', class: '', year: 2024, color: '', internalNumber: '',
  operationCardNumber: '', operationCardExpiry: '', soatNumber: '', soatExpiry: '',
  technicalReviewNumber: '', technicalReviewExpiry: '', preventiveReviewExpiry: '',
  rccPolicy: '', rccExpiry: '', rcePolicy: '', rceExpiry: '',
  ownerName: '', ownerId: '', status: 'available'
};

export default function Vehicles({ vehicles, currentUser, onSave }: VehiclesProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Vehicle>(emptyVehicle);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDetail, setShowDetail] = useState<Vehicle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getDocStatus = (dateStr: string): 'vigente' | 'proximo' | 'vencido' => {
    if (!dateStr) return 'vencido';
    const date = new Date(dateStr);
    const today = new Date();
    const in30days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (date <= today) return 'vencido';
    if (date <= in30days) return 'proximo';
    return 'vigente';
  };

  const isVehicleApto = (v: Vehicle) => {
    const docs = [v.soatExpiry, v.technicalReviewExpiry, v.operationCardExpiry, v.rccExpiry, v.rceExpiry];
    return docs.every(d => getDocStatus(d) !== 'vencido');
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = `${v.plate} ${v.brand} ${v.model} ${v.internalNumber} ${v.ownerName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = () => {
    if (!formData.plate || !formData.brand || !formData.model) return;
    let updated: Vehicle[];
    if (editingVehicle) {
      updated = vehicles.map(v => v.id === editingVehicle.id ? { ...formData, id: editingVehicle.id } : v);
    } else {
      updated = [...vehicles, { ...formData, id: `v-${Date.now()}` }];
    }
    onSave(updated);
    setShowForm(false);
    setEditingVehicle(null);
    setFormData(emptyVehicle);
  };

  const handleDelete = (id: string) => {
    onSave(vehicles.filter(v => v.id !== id));
    setDeleteConfirm(null);
  };

  const canEdit = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vehículos</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de vehículos y documentación</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingVehicle(null); setFormData(emptyVehicle); setShowForm(true); }} className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={18} /> Nuevo Vehículo
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Vehículos</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <p className="text-xs text-green-600 font-medium">Disponibles</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{vehicles.filter(v => v.status === 'available').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
          <p className="text-xs text-blue-600 font-medium">Asignados</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{vehicles.filter(v => v.status === 'assigned').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <p className="text-xs text-red-600 font-medium">No Habilitados</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{vehicles.filter(v => !isVehicleApto(v)).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por placa, marca, modelo, número interno..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="assigned">Asignado</option>
            <option value="maintenance">Mantenimiento</option>
            <option value="disabled">Deshabilitado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Vehículo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Placa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">SOAT</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Tecno-mec.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">T. Operación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Estado Doc.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map(vehicle => {
                const apto = isVehicleApto(vehicle);
                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Truck size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-xs text-slate-500">{vehicle.year} • {vehicle.color} • Int: {vehicle.internalNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono text-sm font-bold text-slate-800">{vehicle.plate}</span></td>
                    <td className="px-4 py-3"><DocBadge date={vehicle.soatExpiry} status={getDocStatus(vehicle.soatExpiry)} /></td>
                    <td className="px-4 py-3"><DocBadge date={vehicle.technicalReviewExpiry} status={getDocStatus(vehicle.technicalReviewExpiry)} /></td>
                    <td className="px-4 py-3"><DocBadge date={vehicle.operationCardExpiry} status={getDocStatus(vehicle.operationCardExpiry)} /></td>
                    <td className="px-4 py-3">
                      {apto ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle size={12} /> APTO</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"><XCircle size={12} /> NO APTO</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'available' ? 'bg-green-100 text-green-700' :
                        vehicle.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        vehicle.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.status === 'available' ? 'Disponible' : vehicle.status === 'assigned' ? 'Asignado' : vehicle.status === 'maintenance' ? 'Mantenimiento' : 'Deshabilitado'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setShowDetail(vehicle)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600"><Eye size={16} /></button>
                        {canEdit && (
                          <>
                            <button onClick={() => { setEditingVehicle(vehicle); setFormData(vehicle); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"><Edit2 size={16} /></button>
                            <button onClick={() => setDeleteConfirm(vehicle.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Placa *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Marca *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Modelo *</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Clase</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Año</label><input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Color</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">N° Interno</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.internalNumber} onChange={e => setFormData({...formData, internalNumber: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Propietario</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">ID Propietario</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})} /></div>
              </div>

              <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">Documentación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">N° Tarjeta de Operación</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.operationCardNumber} onChange={e => setFormData({...formData, operationCardNumber: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Venc. T. Operación</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.operationCardExpiry} onChange={e => setFormData({...formData, operationCardExpiry: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">N° SOAT</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.soatNumber} onChange={e => setFormData({...formData, soatNumber: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Venc. SOAT</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.soatExpiry} onChange={e => setFormData({...formData, soatExpiry: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">N° Tecno-mecánica</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.technicalReviewNumber} onChange={e => setFormData({...formData, technicalReviewNumber: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Venc. Tecno-mec.</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.technicalReviewExpiry} onChange={e => setFormData({...formData, technicalReviewExpiry: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Venc. Rev. Preventiva</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.preventiveReviewExpiry} onChange={e => setFormData({...formData, preventiveReviewExpiry: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Póliza RCC</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.rccPolicy} onChange={e => setFormData({...formData, rccPolicy: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Venc. RCC</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.rccExpiry} onChange={e => setFormData({...formData, rccExpiry: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Póliza RCE</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.rcePolicy} onChange={e => setFormData({...formData, rcePolicy: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Venc. RCE</label><input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.rceExpiry} onChange={e => setFormData({...formData, rceExpiry: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as Vehicle['status']})}>
                    <option value="available">Disponible</option>
                    <option value="assigned">Asignado</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="disabled">Deshabilitado</option>
                  </select>
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

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Detalle del Vehículo</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{showDetail.brand} {showDetail.model} ({showDetail.year})</h3>
                  <p className="text-lg font-mono font-bold text-primary-700">{showDetail.plate}</p>
                  {isVehicleApto(showDetail) ? (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle size={12} /> APTO PARA SERVICIO</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium"><XCircle size={12} /> NO APTO PARA SERVICIO</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Clase:</span> <span className="font-medium">{showDetail.class}</span></div>
                <div><span className="text-slate-500">Color:</span> <span className="font-medium">{showDetail.color}</span></div>
                <div><span className="text-slate-500">N° Interno:</span> <span className="font-medium">{showDetail.internalNumber}</span></div>
                <div><span className="text-slate-500">Propietario:</span> <span className="font-medium">{showDetail.ownerName}</span></div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Documentación</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'SOAT', date: showDetail.soatExpiry },
                    { label: 'Tecno-mecánica', date: showDetail.technicalReviewExpiry },
                    { label: 'T. Operación', date: showDetail.operationCardExpiry },
                    { label: 'Rev. Preventiva', date: showDetail.preventiveReviewExpiry },
                    { label: 'RCC', date: showDetail.rccExpiry },
                    { label: 'RCE', date: showDetail.rceExpiry },
                  ].map(doc => (
                    <div key={doc.label} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600">{doc.label}</span>
                      <DocBadge date={doc.date} status={getDocStatus(doc.date)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle size={20} className="text-danger-500" /></div>
              <h3 className="text-lg font-bold text-slate-800">Confirmar eliminación</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">¿Está seguro que desea eliminar este vehículo?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocBadge({ date, status }: { date: string; status: 'vigente' | 'proximo' | 'vencido' }) {
  const colors = { vigente: 'bg-green-100 text-green-700', proximo: 'bg-amber-100 text-amber-700', vencido: 'bg-red-100 text-red-700' };
  const labels = { vigente: 'Vigente', proximo: 'Próximo', vencido: 'Vencido' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status === 'vigente' ? <CheckCircle size={10} /> : status === 'vencido' ? <XCircle size={10} /> : <AlertTriangle size={10} />}
      {date || 'N/A'} - {labels[status]}
    </span>
  );
}
