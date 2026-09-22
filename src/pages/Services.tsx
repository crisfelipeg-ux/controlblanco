import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, ClipboardList, Printer, Filter, ArrowRight, Clock, MapPin, User, Building2 } from 'lucide-react';
import { Service, ServiceRoute, Passenger, ContractingCompany, Rate, Driver, Vehicle, User as UserType, ServiceStatus, StatusHistory } from '../types';

interface ServicesProps {
  services: Service[];
  passengers: Passenger[];
  companies: ContractingCompany[];
  rates: Rate[];
  drivers: Driver[];
  vehicles: Vehicle[];
  statusHistory: StatusHistory[];
  currentUser: UserType;
  onSave: (services: Service[], history: StatusHistory[]) => void;
}

const emptyRoute: ServiceRoute = { id: '', date: '', origin: '', destination: '', startTime: '', endTime: '', rate: 0, distance: 0, estimatedTime: 0, status: 'Pendiente' };

export default function Services({ services, passengers, companies, rates, drivers, vehicles, statusHistory, currentUser, onSave }: ServicesProps) {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<Service | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formPassengerId, setFormPassengerId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formMipres, setFormMipres] = useState('');
  const [formPrescription, setFormPrescription] = useState('');
  const [formTechnology, setFormTechnology] = useState('No aplica');
  const [formDelivery, setFormDelivery] = useState('');
  const [formRoutes, setFormRoutes] = useState<ServiceRoute[]>([{ ...emptyRoute, id: 'rt-new-1' }]);
  const [passengerSearch, setPassengerSearch] = useState('');
  const [showPassengerSearch, setShowPassengerSearch] = useState(false);

  const getPassenger = (id: string) => passengers.find(p => p.id === id);
  const getCompany = (id: string) => companies.find(c => c.id === id);
  const getDriver = (id: string) => drivers.find(d => d.id === id);
  const getVehicle = (id: string) => vehicles.find(v => v.id === id);

  const calculateTotal = (routes: ServiceRoute[]) => routes.reduce((sum, r) => sum + r.rate, 0);

  const filteredServices = services.filter(s => {
    const passenger = getPassenger(s.passengerId);
    const matchSearch = `${s.serviceNumber} ${passenger?.firstName} ${passenger?.lastName} ${passenger?.idNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchCompany = filterCompany === 'all' || s.companyId === filterCompany;
    let matchDate = true;
    if (filterDateFrom) matchDate = s.createdAt >= filterDateFrom;
    if (filterDateTo) matchDate = matchDate && s.createdAt <= filterDateTo;
    return matchSearch && matchStatus && matchCompany && matchDate;
  });

  const getNextConsecutive = () => Math.max(0, ...services.map(s => s.consecutive)) + 1;
  const getNextServiceNumber = () => `SRV-${new Date().getFullYear()}-${String(getNextConsecutive()).padStart(4, '0')}`;

  const handlePassengerSearch = (query: string) => {
    setPassengerSearch(query);
    const found = passengers.find(p => p.idNumber === query);
    if (found) {
      setFormPassengerId(found.id);
      setShowPassengerSearch(false);
    }
  };

  const openNewService = () => {
    setEditing(null);
    setFormPassengerId('');
    setFormCompanyId('');
    setFormMipres('');
    setFormPrescription('');
    setFormTechnology('No aplica');
    setFormDelivery('');
    setFormRoutes([{ ...emptyRoute, id: 'rt-new-1', date: new Date().toISOString().split('T')[0] }]);
    setPassengerSearch('');
    setShowForm(true);
  };

  const handleSaveService = () => {
    if (!formPassengerId || !formCompanyId || formRoutes.length === 0) return;
    const totalValue = calculateTotal(formRoutes);
    const consecutive = editing ? editing.consecutive : getNextConsecutive();
    const serviceNumber = editing ? editing.serviceNumber : getNextServiceNumber();

    const service: Service = {
      id: editing?.id || `s-${Date.now()}`,
      serviceNumber,
      createdAt: editing?.createdAt || new Date().toISOString().split('T')[0],
      passengerId: formPassengerId,
      companyId: formCompanyId,
      totalValue,
      routeCount: formRoutes.length,
      mipresId: formMipres,
      prescriptionNumber: formPrescription,
      consecutive,
      technology: formTechnology,
      deliveryNumber: formDelivery,
      status: editing?.status || 'GENERADO',
      driverId: editing?.driverId || '',
      vehicleId: editing?.vehicleId || '',
      routes: formRoutes.map((r, i) => ({ ...r, id: r.id || `rt-${Date.now()}-${i}` })),
      observations: '',
    };

    let updatedServices: Service[];
    if (editing) {
      updatedServices = services.map(s => s.id === editing.id ? service : s);
    } else {
      updatedServices = [...services, service];
    }
    onSave(updatedServices, statusHistory);
    setShowForm(false);
    setEditing(null);
  };

  const handleStatusChange = (service: Service, newStatus: ServiceStatus) => {
    const historyEntry: StatusHistory = {
      id: `sh-${Date.now()}`,
      serviceId: service.id,
      previousStatus: service.status,
      newStatus,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      userId: currentUser.id,
      observation: '',
    };
    const updatedServices = services.map(s => s.id === service.id ? { ...s, status: newStatus } : s);
    onSave(updatedServices, [...statusHistory, historyEntry]);
  };

  const canEdit = currentUser.role !== 'consulta';
  const canChangeStatus = currentUser.role === 'admin' || currentUser.role === 'operador';

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'GENERADO': 'bg-slate-100 text-slate-700 border-slate-200',
      'PROGRAMADO': 'bg-blue-100 text-blue-700 border-blue-200',
      'EN PROCESO': 'bg-amber-100 text-amber-700 border-amber-200',
      'TERMINADO': 'bg-green-100 text-green-700 border-green-200',
      'FALLIDO CON COBRO': 'bg-orange-100 text-orange-700 border-orange-200',
      'FALLIDO SIN COBRO': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Servicios</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión y seguimiento de servicios de transporte</p>
        </div>
        {canEdit && (
          <button onClick={openNewService} className="mt-3 md:mt-0 flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus size={18} /> Nuevo Servicio
          </button>
        )}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(['GENERADO', 'PROGRAMADO', 'EN PROCESO', 'TERMINADO', 'FALLIDO CON COBRO', 'FALLIDO SIN COBRO'] as ServiceStatus[]).map(status => (
          <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)} className={`p-3 rounded-xl border text-center transition-all ${filterStatus === status ? 'ring-2 ring-primary-500 shadow-md' : ''} ${getStatusColor(status)}`}>
            <p className="text-lg font-bold">{services.filter(s => s.status === status).length}</p>
            <p className="text-xs font-medium mt-0.5">{status}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por # servicio, usuario, identificación..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
            <option value="all">Todas las empresas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <input type="date" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterCompany('all'); setFilterDateFrom(''); setFilterDateTo(''); }} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Limpiar</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase"># Servicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Recorridos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map(service => {
                const passenger = getPassenger(service.passengerId);
                const company = getCompany(service.companyId);
                return (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-primary-700">{service.serviceNumber}</span>
                      <p className="text-xs text-slate-400">Consec: {service.consecutive}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-700">{passenger?.firstName} {passenger?.lastName}</p>
                      <p className="text-xs text-slate-500">{passenger?.idType} {passenger?.idNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{company?.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{service.createdAt}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-center">{service.routeCount}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">${service.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>{service.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setShowDetail(service)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600"><Eye size={16} /></button>
                        {canEdit && <button onClick={() => { setEditing(service); setFormPassengerId(service.passengerId); setFormCompanyId(service.companyId); setFormMipres(service.mipresId); setFormPrescription(service.prescriptionNumber); setFormTechnology(service.technology); setFormDelivery(service.deliveryNumber); setFormRoutes(service.routes); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"><Edit2 size={16} /></button>}
                        {canChangeStatus && service.status === 'GENERADO' && <button onClick={() => handleStatusChange(service, 'PROGRAMADO')} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Programar"><Clock size={16} /></button>}
                        {canChangeStatus && service.status === 'PROGRAMADO' && <button onClick={() => handleStatusChange(service, 'EN PROCESO')} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500" title="Iniciar"><ArrowRight size={16} /></button>}
                        {canChangeStatus && service.status === 'EN PROCESO' && <button onClick={() => handleStatusChange(service, 'TERMINADO')} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500" title="Terminar"><Edit2 size={16} /></button>}
                        {canEdit && <button onClick={() => setDeleteConfirm(service.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-800">{editing ? `Editar Servicio ${editing.serviceNumber}` : 'Nuevo Servicio'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Passenger Search */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><User size={16} /> Usuario / Pasajero</h3>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar por identificación..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={passengerSearch} onChange={e => { setPassengerSearch(e.target.value); handlePassengerSearch(e.target.value); }} />
                  </div>
                  {formPassengerId && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-sm font-medium text-green-700">{getPassenger(formPassengerId)?.firstName} {getPassenger(formPassengerId)?.lastName}</span>
                    </div>
                  )}
                </div>
                {!formPassengerId && passengerSearch.length > 0 && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                    {passengers.filter(p => `${p.firstName} ${p.lastName} ${p.idNumber}`.toLowerCase().includes(passengerSearch.toLowerCase())).map(p => (
                      <button key={p.id} onClick={() => { setFormPassengerId(p.id); setPassengerSearch(p.idNumber); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <span className="font-medium">{p.firstName} {p.lastName}</span> - <span className="text-slate-500">{p.idType} {p.idNumber}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Empresa Contratante *</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formCompanyId} onChange={e => setFormCompanyId(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">ID MIPRES</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formMipres} onChange={e => setFormMipres(e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">N° Prescripción</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formPrescription} onChange={e => setFormPrescription(e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tecnología</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formTechnology} onChange={e => setFormTechnology(e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">N° Entrega</label><input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={formDelivery} onChange={e => setFormDelivery(e.target.value)} /></div>
                <div className="flex items-end">
                  <div className="w-full p-3 bg-primary-50 border border-primary-200 rounded-lg text-center">
                    <p className="text-xs text-primary-600 font-medium">VALOR TOTAL</p>
                    <p className="text-xl font-bold text-primary-800">${calculateTotal(formRoutes).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Routes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><MapPin size={16} /> Recorridos ({formRoutes.length})</h3>
                  <button onClick={() => setFormRoutes([...formRoutes, { ...emptyRoute, id: `rt-new-${Date.now()}`, date: new Date().toISOString().split('T')[0] }])} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">
                    <Plus size={14} /> Agregar Recorrido
                  </button>
                </div>
                <div className="space-y-3">
                  {formRoutes.map((route, index) => (
                    <div key={route.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">RECORRIDO #{index + 1}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setFormRoutes(formRoutes.filter((_, i) => i !== index))} className="p-1 rounded hover:bg-red-100 text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div><label className="block text-xs text-slate-500 mb-1">Fecha</label><input type="date" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.date} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], date: e.target.value}; setFormRoutes(r); }} /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Hora Inicio</label><input type="time" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.startTime} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], startTime: e.target.value}; setFormRoutes(r); }} /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Hora Fin</label><input type="time" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.endTime} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], endTime: e.target.value}; setFormRoutes(r); }} /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Tarifa</label><input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.rate} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], rate: parseInt(e.target.value) || 0}; setFormRoutes(r); }} /></div>
                        <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">Origen</label><input type="text" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.origin} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], origin: e.target.value}; setFormRoutes(r); }} /></div>
                        <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">Destino</label><input type="text" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.destination} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], destination: e.target.value}; setFormRoutes(r); }} /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Distancia (km)</label><input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.distance} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], distance: parseFloat(e.target.value) || 0}; setFormRoutes(r); }} /></div>
                        <div><label className="block text-xs text-slate-500 mb-1">Tiempo Est. (min)</label><input type="number" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" value={route.estimatedTime} onChange={e => { const r = [...formRoutes]; r[index] = {...r[index], estimatedTime: parseInt(e.target.value) || 0}; setFormRoutes(r); }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 sticky bottom-0 bg-white">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveService} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Guardar Servicio</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Servicio {showDetail.serviceNumber}</h2>
                <p className="text-sm text-slate-500">Consecutivo: {showDetail.consecutive}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(showDetail.status)}`}>{showDetail.status}</span>
                <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-slate-500 block text-xs">Fecha Creación</span><span className="font-medium">{showDetail.createdAt}</span></div>
                <div><span className="text-slate-500 block text-xs">Empresa</span><span className="font-medium">{getCompany(showDetail.companyId)?.name}</span></div>
                <div><span className="text-slate-500 block text-xs">MIPRES</span><span className="font-medium">{showDetail.mipresId || 'N/A'}</span></div>
                <div><span className="text-slate-500 block text-xs">Valor Total</span><span className="font-bold text-primary-700">${showDetail.totalValue.toLocaleString()}</span></div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Usuario</h4>
                <p className="text-sm font-medium">{getPassenger(showDetail.passengerId)?.firstName} {getPassenger(showDetail.passengerId)?.lastName}</p>
                <p className="text-xs text-slate-500">{getPassenger(showDetail.passengerId)?.idType} {getPassenger(showDetail.passengerId)?.idNumber}</p>
              </div>

              {showDetail.driverId && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-1">Conductor Asignado</h4>
                    <p className="text-sm font-medium">{getDriver(showDetail.driverId)?.firstName} {getDriver(showDetail.driverId)?.lastName}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-indigo-700 mb-1">Vehículo Asignado</h4>
                    <p className="text-sm font-medium">{getVehicle(showDetail.vehicleId)?.plate} - {getVehicle(showDetail.vehicleId)?.brand} {getVehicle(showDetail.vehicleId)?.model}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Recorridos</h4>
                <div className="space-y-2">
                  {showDetail.routes.map((route, i) => (
                    <div key={route.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{route.origin} <ArrowRight size={12} className="inline mx-1" /> {route.destination}</p>
                        <p className="text-xs text-slate-500">{route.date} | {route.startTime} - {route.endTime} | {route.distance} km | {route.estimatedTime} min</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700">${route.rate.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Historial de Estados</h4>
                <div className="space-y-2">
                  {statusHistory.filter(h => h.serviceId === showDetail.id).map(h => (
                    <div key={h.id} className="flex items-center gap-3 text-sm p-2 bg-slate-50 rounded-lg">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(h.previousStatus)}`}>{h.previousStatus}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(h.newStatus)}`}>{h.newStatus}</span>
                      <span className="text-xs text-slate-500 ml-auto">{h.date} {h.time}</span>
                    </div>
                  ))}
                  {statusHistory.filter(h => h.serviceId === showDetail.id).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">Sin historial de cambios</p>
                  )}
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
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-slate-600 mb-6">¿Está seguro que desea eliminar este servicio? Se realizará eliminación lógica.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={() => { onSave(services.filter(s => s.id !== deleteConfirm), statusHistory); setDeleteConfirm(null); }} className="px-4 py-2 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
