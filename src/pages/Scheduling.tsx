import React, { useState } from 'react';
import { Calendar, Search, CheckCircle, XCircle, AlertTriangle, Truck, Users, ArrowRight, Clock } from 'lucide-react';
import { Service, Driver, Vehicle, Passenger, ContractingCompany, User, StatusHistory } from '../types';

interface SchedulingProps {
  services: Service[];
  drivers: Driver[];
  vehicles: Vehicle[];
  passengers: Passenger[];
  companies: ContractingCompany[];
  currentUser: User;
  onSave: (services: Service[], history: StatusHistory[]) => void;
}

export default function Scheduling({ services, drivers, vehicles, passengers, companies, currentUser, onSave }: SchedulingProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pendingServices = services.filter(s => s.status === 'GENERADO' || s.status === 'PROGRAMADO');

  const getPassenger = (id: string) => passengers.find(p => p.id === id);
  const getCompany = (id: string) => companies.find(c => c.id === id);

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

  const isVehicleApto = (vehicle: Vehicle) => {
    const docs = [vehicle.soatExpiry, vehicle.technicalReviewExpiry, vehicle.operationCardExpiry, vehicle.rccExpiry, vehicle.rceExpiry];
    return docs.every(d => getDocStatus(d) !== 'vencido');
  };

  const isDriverAvailable = (driverId: string, serviceDate: string, startTime: string, endTime: string) => {
    const assigned = services.filter(s => s.driverId === driverId && s.status !== 'TERMINADO' && s.status !== 'FALLIDO SIN COBRO' && s.status !== 'FALLIDO CON COBRO');
    return !assigned.some(s => {
      if (s.routes.length === 0) return false;
      const route = s.routes[0];
      return route.date === serviceDate && !(endTime <= route.startTime || startTime >= route.endTime);
    });
  };

  const isVehicleAvailable = (vehicleId: string, serviceDate: string, startTime: string, endTime: string) => {
    const assigned = services.filter(s => s.vehicleId === vehicleId && s.status !== 'TERMINADO' && s.status !== 'FALLIDO SIN COBRO' && s.status !== 'FALLIDO CON COBRO');
    return !assigned.some(s => {
      if (s.routes.length === 0) return false;
      const route = s.routes[0];
      return route.date === serviceDate && !(endTime <= route.startTime || startTime >= route.endTime);
    });
  };

  const handleAssign = () => {
    if (!selectedService || !selectedDriver || !selectedVehicle) return;
    const driver = drivers.find(d => d.id === selectedDriver);
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!driver || !vehicle) return;
    if (!isDriverApto(driver) || !isVehicleApto(vehicle)) return;

    const updatedServices = services.map(s => {
      if (s.id === selectedService.id) {
        return { ...s, driverId: selectedDriver, vehicleId: selectedVehicle, status: 'PROGRAMADO' as const };
      }
      return s;
    });

    const historyEntry: StatusHistory = {
      id: `sh-${Date.now()}`,
      serviceId: selectedService.id,
      previousStatus: selectedService.status,
      newStatus: 'PROGRAMADO',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      userId: currentUser.id,
      observation: `Asignado conductor ${driver.firstName} ${driver.lastName} y vehículo ${vehicle.plate}`,
    };

    onSave(updatedServices, [historyEntry]);
    setSelectedService(null);
    setSelectedDriver('');
    setSelectedVehicle('');
    setShowConfirmation(false);
  };

  const filteredDrivers = drivers.filter(d =>
    d.status === 'active' && `${d.firstName} ${d.lastName} ${d.idNumber}`.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredVehicles = vehicles.filter(v =>
    (v.status === 'available' || v.status === 'assigned') && `${v.plate} ${v.brand} ${v.model} ${v.internalNumber}`.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const selectedDriverData = drivers.find(d => d.id === selectedDriver);
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

  const canAssign = selectedDriver && selectedVehicle && selectedDriverData && selectedVehicleData && isDriverApto(selectedDriverData) && isVehicleApto(selectedVehicleData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Programación de Servicios</h1>
        <p className="text-slate-500 text-sm mt-1">Asignación de conductores y vehículos a servicios pendientes</p>
      </div>

      {/* Pending Services */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar size={16} className="text-primary-600" />
            Servicios Pendientes de Programación ({pendingServices.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase"># Servicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Origen → Destino</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Fecha/Hora</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingServices.map(service => {
                const passenger = getPassenger(service.passengerId);
                const company = getCompany(service.companyId);
                const route = service.routes[0];
                return (
                  <tr key={service.id} className={`hover:bg-slate-50 ${selectedService?.id === service.id ? 'bg-primary-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-bold text-primary-700">{service.serviceNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{passenger?.firstName} {passenger?.lastName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{company?.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">{route?.origin} → {route?.destination}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{route?.date} {route?.startTime}</td>
                    <td className="px-4 py-3 text-sm font-bold text-right">${service.totalValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.status === 'GENERADO' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setSelectedService(service); setSelectedDriver(service.driverId || ''); setSelectedVehicle(service.vehicleId || ''); }} className="px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">
                        Programar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pendingServices.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">No hay servicios pendientes de programación</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Panel */}
      {selectedService && (
        <div className="bg-white rounded-xl border border-primary-200 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-primary-200 bg-primary-50">
            <h3 className="text-sm font-bold text-primary-800">Programar Servicio: {selectedService.serviceNumber}</h3>
          </div>
          <div className="p-6">
            {/* Service Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm bg-slate-50 rounded-xl p-4">
              <div><span className="text-slate-500 block text-xs">Usuario</span><span className="font-medium">{getPassenger(selectedService.passengerId)?.firstName} {getPassenger(selectedService.passengerId)?.lastName}</span></div>
              <div><span className="text-slate-500 block text-xs">Empresa</span><span className="font-medium">{getCompany(selectedService.companyId)?.name}</span></div>
              <div><span className="text-slate-500 block text-xs">Fecha</span><span className="font-medium">{selectedService.routes[0]?.date}</span></div>
              <div><span className="text-slate-500 block text-xs">Valor</span><span className="font-bold text-primary-700">${selectedService.totalValue.toLocaleString()}</span></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Driver Selection */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Users size={16} className="text-primary-600" /> Conductor</h4>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar conductor..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={driverSearch} onChange={e => setDriverSearch(e.target.value)} />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
                  {filteredDrivers.map(driver => {
                    const apto = isDriverApto(driver);
                    const route = selectedService.routes[0];
                    const available = route ? isDriverAvailable(driver.id, route.date, route.startTime, route.endTime) : true;
                    return (
                      <button key={driver.id} onClick={() => setSelectedDriver(driver.id)} className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${selectedDriver === driver.id ? 'bg-primary-100 border border-primary-300' : 'hover:bg-slate-50'} ${!apto ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{driver.firstName} {driver.lastName}</p>
                            <p className="text-xs text-slate-500">{driver.idType} {driver.idNumber} | Lic: {driver.licenseCategory}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {apto ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                            {!available && <AlertTriangle size={14} className="text-amber-500" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedDriverData && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${isDriverApto(selectedDriverData) ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {isDriverApto(selectedDriverData) ? (
                      <p className="text-green-700 font-medium flex items-center gap-1"><CheckCircle size={14} /> Conductor APTO para servicio</p>
                    ) : (
                      <p className="text-red-700 font-medium flex items-center gap-1"><XCircle size={14} /> Conductor NO APTO - Documentación vencida</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Licencia: {selectedDriverData.licenseExpiry} | Seg. Social: {selectedDriverData.socialSecurityExpiry}</p>
                  </div>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Truck size={16} className="text-primary-600" /> Vehículo</h4>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar por placa o n° interno..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
                  {filteredVehicles.map(vehicle => {
                    const apto = isVehicleApto(vehicle);
                    const route = selectedService.routes[0];
                    const available = route ? isVehicleAvailable(vehicle.id, route.date, route.startTime, route.endTime) : true;
                    return (
                      <button key={vehicle.id} onClick={() => setSelectedVehicle(vehicle.id)} className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${selectedVehicle === vehicle.id ? 'bg-primary-100 border border-primary-300' : 'hover:bg-slate-50'} ${!apto ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700">{vehicle.plate} - {vehicle.brand} {vehicle.model}</p>
                            <p className="text-xs text-slate-500">Int: {vehicle.internalNumber} | {vehicle.year}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {apto ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                            {!available && <AlertTriangle size={14} className="text-amber-500" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedVehicleData && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${isVehicleApto(selectedVehicleData) ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {isVehicleApto(selectedVehicleData) ? (
                      <p className="text-green-700 font-medium flex items-center gap-1"><CheckCircle size={14} /> Vehículo APTO para servicio</p>
                    ) : (
                      <p className="text-red-700 font-medium flex items-center gap-1"><XCircle size={14} /> Vehículo NO APTO - Documentación vencida</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">SOAT: {selectedVehicleData.soatExpiry} | Tecno: {selectedVehicleData.technicalReviewExpiry} | T.Op: {selectedVehicleData.operationCardExpiry}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button onClick={() => { setSelectedService(null); setSelectedDriver(''); setSelectedVehicle(''); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button
                onClick={() => { if (canAssign) setShowConfirmation(true); }}
                disabled={!canAssign}
                className={`px-6 py-2 text-sm font-medium rounded-lg shadow-sm ${canAssign ? 'text-white bg-primary-600 hover:bg-primary-700' : 'text-slate-400 bg-slate-100 cursor-not-allowed'}`}
              >
                Confirmar Asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Confirmar Programación</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Servicio:</span>
                <span className="font-medium">{selectedService?.serviceNumber}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Conductor:</span>
                <span className="font-medium">{selectedDriverData?.firstName} {selectedDriverData?.lastName}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Vehículo:</span>
                <span className="font-medium">{selectedVehicleData?.plate}</span>
              </div>
              <div className="flex justify-between p-2 bg-green-50 rounded-lg">
                <span className="text-green-600 font-medium">Estado:</span>
                <span className="font-bold text-green-700">APTO PARA SERVICIO ✓</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleAssign} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
