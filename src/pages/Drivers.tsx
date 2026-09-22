import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, AlertTriangle, CheckCircle, XCircle, Users, X } from 'lucide-react';
import { Driver, User } from '../types';

interface DriversProps {
  drivers: Driver[];
  currentUser: User;
  onSave: (drivers: Driver[]) => void;
}

const emptyDriver: Driver = {
  id: '', firstName: '', lastName: '', idType: 'CC', idNumber: '', phone: '', address: '', email: '',
  licenseNumber: '', licenseCategory: 'C2', licenseExpiry: '', socialSecurityNumber: '', socialSecurityExpiry: '', vehiclePlate: '', status: 'active'
};

export default function Drivers({ drivers, currentUser, onSave }: DriversProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<Driver>(emptyDriver);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDocStatus, setFilterDocStatus] = useState<string>('all');
  const [showDetail, setShowDetail] = useState<Driver | null>(null);
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

  const isDriverApto = (driver: Driver) => {
    return getDocStatus(driver.licenseExpiry) !== 'vencido' && getDocStatus(driver.socialSecurityExpiry) !== 'vencido';
  };

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = `${d.firstName} ${d.lastName} ${d.idNumber} ${d.licenseNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    let matchesDoc = true;
    if (filterDocStatus === 'apto') matchesDoc = isDriverApto(d);
    else if (filterDocStatus === 'no-apto') matchesDoc = !isDriverApto(d);
    else if (filterDocStatus === 'vencido') matchesDoc = getDocStatus(d.licenseExpiry) === 'vencido' || getDocStatus(d.socialSecurityExpiry) === 'vencido';
    return matchesSearch && matchesStatus && matchesDoc;
  });

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.licenseNumber) return;
    let updated: Driver[];
    if (editingDriver) {
      updated = drivers.map(d => d.id === editingDriver.id ? { ...formData, id: editingDriver.id } : d);
    } else {
      updated = [...drivers, { ...formData, id: `d-${Date.now()}` }];
    }
    onSave(updated);
    setShowForm(false);
    setEditingDriver(null);
    setFormData(emptyDriver);
  };

  const handleDelete = (id: string) => {
    onSave(drivers.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  const openEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData(driver);
    setShowForm(true);
  };

  const openNew = () => {
    setEditingDriver(null);
    setFormData(emptyDriver);
    setShowForm(true);
  };

  const canEdit = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Conductores</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de conductores y documentación</p>
        </div>
        {canEdit && (
          <button onClick={openNew} className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={18} /> Nuevo Conductor
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Conductores</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{drivers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
          <p className="text-xs text-green-600 font-medium">Aptos para Servicio</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{drivers.filter(d => isDriverApto(d)).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
          <p className="text-xs text-amber-600 font-medium">Próximos a Vencer</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{drivers.filter(d => getDocStatus(d.licenseExpiry) === 'proximo' || getDocStatus(d.socialSecurityExpiry) === 'proximo').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
          <p className="text-xs text-red-600 font-medium">Documentos Vencidos</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{drivers.filter(d => getDocStatus(d.licenseExpiry) === 'vencido' || getDocStatus(d.socialSecurityExpiry) === 'vencido').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por nombre, identificación o licencia..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={filterDocStatus} onChange={e => setFilterDocStatus(e.target.value)}>
            <option value="all">Toda documentación</option>
            <option value="apto">Aptos</option>
            <option value="no-apto">No Aptos</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Conductor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Identificación</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Licencia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Venc. Licencia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Seg. Social</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Estado Doc.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map(driver => {
                const licStatus = getDocStatus(driver.licenseExpiry);
                const ssStatus = getDocStatus(driver.socialSecurityExpiry);
                const apto = isDriverApto(driver);
                return (
                  <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold">
                          {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{driver.firstName} {driver.lastName}</p>
                          <p className="text-xs text-slate-500">{driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{driver.idType} {driver.idNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{driver.licenseNumber} ({driver.licenseCategory})</td>
                    <td className="px-4 py-3"><DocDateBadge date={driver.licenseExpiry} status={licStatus} /></td>
                    <td className="px-4 py-3"><DocDateBadge date={driver.socialSecurityExpiry} status={ssStatus} /></td>
                    <td className="px-4 py-3">
                      {apto ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle size={12} /> APTO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle size={12} /> NO APTO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {driver.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setShowDetail(driver)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600" title="Ver detalle">
                          <Eye size={16} />
                        </button>
                        {canEdit && (
                          <>
                            <button onClick={() => openEdit(driver)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600" title="Editar">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirm(driver.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600" title="Eliminar">
                              <Trash2 size={16} />
                            </button>
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
        {filteredDrivers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>No se encontraron conductores</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">{editingDriver ? 'Editar Conductor' : 'Nuevo Conductor'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Identificación</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Identificación *</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Licencia *</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría de Licencia</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.licenseCategory} onChange={e => setFormData({...formData, licenseCategory: e.target.value})}>
                  <option value="C2">C2</option>
                  <option value="C3">C3</option>
                  <option value="B2">B2</option>
                  <option value="B3">B3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento de Licencia *</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">N° Seguridad Social</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.socialSecurityNumber} onChange={e => setFormData({...formData, socialSecurityNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento Seg. Social</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.socialSecurityExpiry} onChange={e => setFormData({...formData, socialSecurityExpiry: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placa de Vehículo Asignado</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.vehiclePlate} onChange={e => setFormData({...formData, vehiclePlate: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
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

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Detalle del Conductor</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xl font-bold">
                  {showDetail.firstName.charAt(0)}{showDetail.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{showDetail.firstName} {showDetail.lastName}</h3>
                  <p className="text-sm text-slate-500">{showDetail.idType} {showDetail.idNumber}</p>
                  {isDriverApto(showDetail) ? (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"><CheckCircle size={12} /> APTO PARA SERVICIO</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium"><XCircle size={12} /> NO APTO PARA SERVICIO</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Teléfono:</span> <span className="font-medium text-slate-700">{showDetail.phone}</span></div>
                <div><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-700">{showDetail.email}</span></div>
                <div className="col-span-2"><span className="text-slate-500">Dirección:</span> <span className="font-medium text-slate-700">{showDetail.address}</span></div>
                <div><span className="text-slate-500">Licencia:</span> <span className="font-medium text-slate-700">{showDetail.licenseNumber} ({showDetail.licenseCategory})</span></div>
                <div><span className="text-slate-500">Venc. Licencia:</span> <DocDateBadge date={showDetail.licenseExpiry} status={getDocStatus(showDetail.licenseExpiry)} /></div>
                <div><span className="text-slate-500">Seg. Social:</span> <span className="font-medium text-slate-700">{showDetail.socialSecurityNumber}</span></div>
                <div><span className="text-slate-500">Venc. Seg. Social:</span> <DocDateBadge date={showDetail.socialSecurityExpiry} status={getDocStatus(showDetail.socialSecurityExpiry)} /></div>
                <div><span className="text-slate-500">Vehículo:</span> <span className="font-medium text-slate-700">{showDetail.vehiclePlate || 'Sin asignar'}</span></div>
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
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-danger-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Confirmar eliminación</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">¿Está seguro que desea eliminar este conductor? Esta acción no se puede deshacer.</p>
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

function DocDateBadge({ date, status }: { date: string; status: 'vigente' | 'proximo' | 'vencido' }) {
  const colors = { vigente: 'bg-green-100 text-green-700', proximo: 'bg-amber-100 text-amber-700', vencido: 'bg-red-100 text-red-700' };
  const labels = { vigente: 'Vigente', proximo: 'Próximo', vencido: 'Vencido' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status === 'vigente' ? <CheckCircle size={10} /> : status === 'vencido' ? <XCircle size={10} /> : <AlertTriangle size={10} />}
      {date} - {labels[status]}
    </span>
  );
}
