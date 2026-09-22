import { User, Driver, Vehicle, Passenger, ContractingCompany, Rate, Service, ServiceStatus, Alert, AuditLog, Municipality, StatusHistory } from './types';

const STORAGE_KEY = 'transgestion_data';

const municipalities: Municipality[] = [
  { code: '05001', name: 'Medellín', department: 'Antioquia' },
  { code: '05002', name: 'Abejorral', department: 'Antioquia' },
  { code: '05004', name: 'Abriaquí', department: 'Antioquia' },
  { code: '05021', name: 'Bello', department: 'Antioquia' },
  { code: '05030', name: 'Caldas', department: 'Antioquia' },
  { code: '05042', name: 'Copacabana', department: 'Antioquia' },
  { code: '05051', name: 'Envigado', department: 'Antioquia' },
  { code: '05088', name: 'Itagüí', department: 'Antioquia' },
  { code: '05091', name: 'La Estrella', department: 'Antioquia' },
  { code: '05101', name: 'Rionegro', department: 'Antioquia' },
  { code: '05120', name: 'Sabaneta', department: 'Antioquia' },
  { code: '05129', name: 'Caucasia', department: 'Antioquia' },
  { code: '05142', name: 'Apartadó', department: 'Antioquia' },
  { code: '05148', name: 'Turbo', department: 'Antioquia' },
  { code: '11001', name: 'Bogotá D.C.', department: 'Cundinamarca' },
  { code: '25001', name: 'Agua de Dios', department: 'Cundinamarca' },
  { code: '25035', name: 'Cajicá', department: 'Cundinamarca' },
  { code: '25053', name: 'Chía', department: 'Cundinamarca' },
  { code: '25086', name: 'Facatativá', department: 'Cundinamarca' },
  { code: '25099', name: 'Funza', department: 'Cundinamarca' },
  { code: '25120', name: 'Girardot', department: 'Cundinamarca' },
  { code: '25148', name: 'Madrid', department: 'Cundinamarca' },
  { code: '25168', name: 'Mosquera', department: 'Cundinamarca' },
  { code: '25258', name: 'Soacha', department: 'Cundinamarca' },
  { code: '25269', name: 'Sopó', department: 'Cundinamarca' },
  { code: '25279', name: 'Subachoque', department: 'Cundinamarca' },
  { code: '25281', name: 'Suesca', department: 'Cundinamarca' },
  { code: '25754', name: 'Zipaquirá', department: 'Cundinamarca' },
  { code: '76001', name: 'Cali', department: 'Valle del Cauca' },
  { code: '76109', name: 'Buenaventura', department: 'Valle del Cauca' },
  { code: '76111', name: 'Cartago', department: 'Valle del Cauca' },
  { code: '76122', name: 'Tuluá', department: 'Valle del Cauca' },
  { code: '08001', name: 'Barranquilla', department: 'Atlántico' },
  { code: '13001', name: 'Cartagena', department: 'Bolívar' },
  { code: '68001', name: 'Bucaramanga', department: 'Santander' },
  { code: '66001', name: 'Pereira', department: 'Risaralda' },
  { code: '17001', name: 'Manizales', department: 'Caldas' },
  { code: '63001', name: 'Armenia', department: 'Quindío' },
  { code: '52001', name: 'Pasto', department: 'Nariño' },
  { code: '54001', name: 'Cúcuta', department: 'Norte de Santander' },
];

const defaultDrivers: Driver[] = [
  { id: 'd1', firstName: 'Carlos', lastName: 'Martínez López', idType: 'CC', idNumber: '79123456', phone: '3101234567', address: 'Cra 45 #12-30', email: 'carlos.martinez@email.com', licenseNumber: 'LIC-001234', licenseCategory: 'C2', licenseExpiry: '2026-08-15', socialSecurityNumber: 'SS-78901', socialSecurityExpiry: '2026-03-30', vehiclePlate: 'ABC123', status: 'active' },
  { id: 'd2', firstName: 'Miguel', lastName: 'Ángel Rodríguez', idType: 'CC', idNumber: '1023456789', phone: '3159876543', address: 'Calle 80 #23-45', email: 'miguel.rodriguez@email.com', licenseNumber: 'LIC-005678', licenseCategory: 'C2', licenseExpiry: '2025-12-20', socialSecurityNumber: 'SS-45678', socialSecurityExpiry: '2026-02-15', vehiclePlate: 'DEF456', status: 'active' },
  { id: 'd3', firstName: 'José', lastName: 'Fernando Gómez', idType: 'CC', idNumber: '80234567', phone: '3201112233', address: 'Av 68 #45-12', email: 'jose.gomez@email.com', licenseNumber: 'LIC-009012', licenseCategory: 'C3', licenseExpiry: '2025-01-10', socialSecurityNumber: 'SS-12345', socialSecurityExpiry: '2025-01-05', vehiclePlate: '', status: 'inactive' },
  { id: 'd4', firstName: 'Andrés', lastName: 'Felipe Castaño', idType: 'CC', idNumber: '1098765432', phone: '3187654321', address: 'Calle 50 #10-20', email: 'andres.castano@email.com', licenseNumber: 'LIC-003456', licenseCategory: 'C2', licenseExpiry: '2027-05-20', socialSecurityNumber: 'SS-67890', socialSecurityExpiry: '2026-06-15', vehiclePlate: 'GHI789', status: 'active' },
];

const defaultVehicles: Vehicle[] = [
  { id: 'v1', plate: 'ABC123', brand: 'Toyota', model: 'Hiace', class: 'Microbús', year: 2022, color: 'Blanco', internalNumber: 'VH-001', operationCardNumber: 'TO-2022-001', operationCardExpiry: '2026-12-31', soatNumber: 'SOAT-001', soatExpiry: '2026-06-15', technicalReviewNumber: 'RT-001', technicalReviewExpiry: '2026-09-20', preventiveReviewExpiry: '2026-04-10', rccPolicy: 'RCC-001', rccExpiry: '2026-07-30', rcePolicy: 'RCE-001', rceExpiry: '2026-07-30', ownerName: 'Transportes El Líder S.A.S', ownerId: '900123456', status: 'available' },
  { id: 'v2', plate: 'DEF456', brand: 'Chevrolet', model: 'NHR', class: 'Camioneta', year: 2023, color: 'Plateado', internalNumber: 'VH-002', operationCardNumber: 'TO-2023-002', operationCardExpiry: '2027-03-15', soatNumber: 'SOAT-002', soatExpiry: '2026-08-20', technicalReviewNumber: 'RT-002', technicalReviewExpiry: '2026-11-10', preventiveReviewExpiry: '2026-05-05', rccPolicy: 'RCC-002', rccExpiry: '2026-10-15', rcePolicy: 'RCE-002', rceExpiry: '2026-10-15', ownerName: 'Transportes El Líder S.A.S', ownerId: '900123456', status: 'available' },
  { id: 'v3', plate: 'GHI789', brand: 'Hyundai', model: 'H-1', class: 'Van', year: 2021, color: 'Blanco', internalNumber: 'VH-003', operationCardNumber: 'TO-2021-003', operationCardExpiry: '2026-06-30', soatNumber: 'SOAT-003', soatExpiry: '2026-04-01', technicalReviewNumber: 'RT-003', technicalReviewExpiry: '2026-07-15', preventiveReviewExpiry: '2026-03-20', rccPolicy: 'RCC-003', rccExpiry: '2026-08-10', rcePolicy: 'RCE-003', rceExpiry: '2026-08-10', ownerName: 'María Elena Restrepo', ownerId: '52345678', status: 'available' },
  { id: 'v4', plate: 'JKL012', brand: 'Renault', model: 'Master', class: 'Furgón', year: 2020, color: 'Gris', internalNumber: 'VH-004', operationCardNumber: 'TO-2020-004', operationCardExpiry: '2025-01-15', soatNumber: 'SOAT-004', soatExpiry: '2025-12-20', technicalReviewNumber: 'RT-004', technicalReviewExpiry: '2026-02-28', preventiveReviewExpiry: '2026-01-10', rccPolicy: 'RCC-004', rccExpiry: '2026-05-20', rcePolicy: 'RCE-004', rceExpiry: '2026-05-20', ownerName: 'Transportes El Líder S.A.S', ownerId: '900123456', status: 'disabled' },
];

const defaultPassengers: Passenger[] = [
  { id: 'p1', firstName: 'María', lastName: 'Elena Ospina', idType: 'CC', idNumber: '52345678', address: 'Calle 45 #12-30', locality: 'Laureles', phone: '3101112233', hasResponsible: false, responsibleName: '' },
  { id: 'p2', firstName: 'Pedro', lastName: 'Luis Sánchez', idType: 'CC', idNumber: '71234567', address: 'Cra 70 #20-15', locality: 'Belén', phone: '3152223344', hasResponsible: false, responsibleName: '' },
  { id: 'p3', firstName: 'Ana', lastName: 'María Restrepo', idType: 'CC', idNumber: '1023456789', address: 'Calle 62 #38-10', locality: 'Robledo', phone: '3203334455', hasResponsible: true, responsibleName: 'Luisa Fernanda Restrepo' },
  { id: 'p4', firstName: 'Jorge', lastName: 'Eduardo Mejía', idType: 'CE', idNumber: 'E-123456', address: 'Av 80 #10-55', locality: 'Castilla', phone: '3184445566', hasResponsible: false, responsibleName: '' },
  { id: 'p5', firstName: 'Carmen', lastName: 'Rosa Vélez', idType: 'CC', idNumber: '23456789', address: 'Calle 33 #15-20', locality: 'La América', phone: '3105556677', hasResponsible: true, responsibleName: 'Diana Patricia Vélez' },
];

const defaultCompanies: ContractingCompany[] = [
  { id: 'c1', name: 'EPS Sura', idType: 'NIT', idNumber: '890980511', address: 'Calle 49 #42-15', phone: '6044445555', contractObject: 'Transporte de usuarios de la salud', contractNumber: 'CT-2024-001' },
  { id: 'c2', name: 'Colegio San Ignacio', idType: 'NIT', idNumber: '890900123', address: 'Cra 43 #55-20', phone: '6043334444', contractObject: 'Transporte escolar', contractNumber: 'CT-2024-002' },
  { id: 'c3', name: 'Grupo Empresarial Antioqueño', idType: 'NIT', idNumber: '890900456', address: 'Calle 10 #30-40', phone: '6042223333', contractObject: 'Transporte empresarial', contractNumber: 'CT-2024-003' },
  { id: 'c4', name: 'Agencia de Turismo Caribe', idType: 'NIT', idNumber: '890900789', address: 'Cra 35 #15-25', phone: '6041112222', contractObject: 'Turismo', contractNumber: 'CT-2024-004' },
];

const defaultRates: Rate[] = [
  { id: 'r1', companyId: 'c1', transferType: 'sencillo', municipality: 'Medellín', value: 45000 },
  { id: 'r2', companyId: 'c1', transferType: 'doble', municipality: 'Medellín', value: 85000 },
  { id: 'r3', companyId: 'c1', transferType: 'sencillo', municipality: 'Bello', value: 55000 },
  { id: 'r4', companyId: 'c1', transferType: 'doble', municipality: 'Bello', value: 100000 },
  { id: 'r5', companyId: 'c2', transferType: 'sencillo', municipality: 'Medellín', value: 35000 },
  { id: 'r6', companyId: 'c2', transferType: 'doble', municipality: 'Medellín', value: 65000 },
  { id: 'r7', companyId: 'c3', transferType: 'sencillo', municipality: 'Medellín', value: 50000 },
  { id: 'r8', companyId: 'c3', transferType: 'sencillo', municipality: 'Envigado', value: 60000 },
  { id: 'r9', companyId: 'c4', transferType: 'sencillo', municipality: 'Medellín', value: 75000 },
  { id: 'r10', companyId: 'c4', transferType: 'doble', municipality: 'Cartagena', value: 250000 },
];

const defaultServices: Service[] = [
  { id: 's1', serviceNumber: 'SRV-2025-0001', createdAt: '2025-01-15', passengerId: 'p1', companyId: 'c1', totalValue: 45000, routeCount: 1, mipresId: 'MIP-001', prescriptionNumber: 'PRE-001', consecutive: 1, technology: 'No aplica', deliveryNumber: 'ENT-001', status: 'TERMINADO', driverId: 'd1', vehicleId: 'v1', routes: [{ id: 'rt1', date: '2025-01-15', origin: 'Calle 45 #12-30, Medellín', destination: 'Clínica Sura, Medellín', startTime: '08:00', endTime: '08:45', rate: 45000, distance: 8.5, estimatedTime: 25, status: 'Completado' }], observations: '' },
  { id: 's2', serviceNumber: 'SRV-2025-0002', createdAt: '2025-01-16', passengerId: 'p2', companyId: 'c1', totalValue: 100000, routeCount: 2, mipresId: 'MIP-002', prescriptionNumber: 'PRE-002', consecutive: 2, technology: 'No aplica', deliveryNumber: 'ENT-002', status: 'TERMINADO', driverId: 'd2', vehicleId: 'v2', routes: [{ id: 'rt2', date: '2025-01-16', origin: 'Cra 70 #20-15, Medellín', destination: 'Hospital San Vicente, Bello', startTime: '07:00', endTime: '07:50', rate: 55000, distance: 12, estimatedTime: 35, status: 'Completado' }, { id: 'rt3', date: '2025-01-16', origin: 'Hospital San Vicente, Bello', destination: 'Cra 70 #20-15, Medellín', startTime: '12:00', endTime: '12:45', rate: 45000, distance: 12, estimatedTime: 30, status: 'Completado' }], observations: '' },
  { id: 's3', serviceNumber: 'SRV-2025-0003', createdAt: '2025-01-17', passengerId: 'p3', companyId: 'c2', totalValue: 35000, routeCount: 1, mipresId: '', prescriptionNumber: '', consecutive: 3, technology: 'No aplica', deliveryNumber: '', status: 'PROGRAMADO', driverId: 'd1', vehicleId: 'v1', routes: [{ id: 'rt4', date: '2025-01-20', origin: 'Calle 62 #38-10, Medellín', destination: 'Colegio San Ignacio, Medellín', startTime: '06:30', endTime: '07:15', rate: 35000, distance: 6, estimatedTime: 20, status: 'Pendiente' }], observations: '' },
  { id: 's4', serviceNumber: 'SRV-2025-0004', createdAt: '2025-01-18', passengerId: 'p4', companyId: 'c3', totalValue: 50000, routeCount: 1, mipresId: '', prescriptionNumber: '', consecutive: 4, technology: 'No aplica', deliveryNumber: '', status: 'GENERADO', driverId: '', vehicleId: '', routes: [{ id: 'rt5', date: '2025-01-22', origin: 'Av 80 #10-55, Medellín', destination: 'Oficinas GEA, Medellín', startTime: '07:30', endTime: '08:00', rate: 50000, distance: 5, estimatedTime: 15, status: 'Pendiente' }], observations: '' },
  { id: 's5', serviceNumber: 'SRV-2025-0005', createdAt: '2025-01-18', passengerId: 'p5', companyId: 'c1', totalValue: 85000, routeCount: 2, mipresId: 'MIP-005', prescriptionNumber: 'PRE-005', consecutive: 5, technology: 'Silla de ruedas', deliveryNumber: 'ENT-005', status: 'EN PROCESO', driverId: 'd4', vehicleId: 'v3', routes: [{ id: 'rt6', date: '2025-01-18', origin: 'Calle 33 #15-20, Medellín', destination: 'Clínica Sura, Medellín', startTime: '09:00', endTime: '09:40', rate: 45000, distance: 7, estimatedTime: 20, status: 'En ejecución' }, { id: 'rt7', date: '2025-01-18', origin: 'Clínica Sura, Medellín', destination: 'Calle 33 #15-20, Medellín', startTime: '14:00', endTime: '14:40', rate: 40000, distance: 7, estimatedTime: 20, status: 'Pendiente' }], observations: '' },
];

const defaultStatusHistory: StatusHistory[] = [
  { id: 'sh1', serviceId: 's1', previousStatus: 'GENERADO', newStatus: 'PROGRAMADO', date: '2025-01-15', time: '08:00', userId: 'u1', observation: 'Programado con conductor Carlos Martínez' },
  { id: 'sh2', serviceId: 's1', previousStatus: 'PROGRAMADO', newStatus: 'EN PROCESO', date: '2025-01-15', time: '07:55', userId: 'u1', observation: '' },
  { id: 'sh3', serviceId: 's1', previousStatus: 'EN PROCESO', newStatus: 'TERMINADO', date: '2025-01-15', time: '09:00', userId: 'u1', observation: 'Servicio completado exitosamente' },
  { id: 'sh4', serviceId: 's5', previousStatus: 'GENERADO', newStatus: 'PROGRAMADO', date: '2025-01-18', time: '08:30', userId: 'u2', observation: '' },
  { id: 'sh5', serviceId: 's5', previousStatus: 'PROGRAMADO', newStatus: 'EN PROCESO', date: '2025-01-18', time: '08:50', userId: 'u1', observation: '' },
];

const defaultUsers: User[] = [
  { id: 'u1', username: 'admin', name: 'Administrador General', role: 'admin', email: 'admin@transgestion.com', active: true },
  { id: 'u2', username: 'operador1', name: 'Laura Martínez', role: 'operador', email: 'laura@transgestion.com', active: true },
  { id: 'u3', username: 'consulta1', name: 'Roberto Silva', role: 'consulta', email: 'roberto@transgestion.com', active: true },
];

interface AppData {
  users: User[];
  currentUser: User;
  drivers: Driver[];
  vehicles: Vehicle[];
  passengers: Passenger[];
  companies: ContractingCompany[];
  rates: Rate[];
  services: Service[];
  statusHistory: StatusHistory[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  municipalities: Municipality[];
}

function generateAlerts(data: Partial<AppData>): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();
  const threshold30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (data.drivers) {
    data.drivers.forEach(d => {
      const licExp = new Date(d.licenseExpiry);
      if (licExp <= today) {
        alerts.push({ id: `al-${d.id}-lic`, type: 'danger', title: 'Licencia vencida', message: `Licencia del conductor ${d.firstName} ${d.lastName} está vencida`, entity: 'driver', entityId: d.id, expiryDate: d.licenseExpiry, daysRemaining: 0, read: false });
      } else if (licExp <= threshold30) {
        const days = Math.ceil((licExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({ id: `al-${d.id}-lic-w`, type: 'warning', title: 'Licencia próxima a vencer', message: `Licencia de ${d.firstName} ${d.lastName} vence en ${days} días`, entity: 'driver', entityId: d.id, expiryDate: d.licenseExpiry, daysRemaining: days, read: false });
      }
      const ssExp = new Date(d.socialSecurityExpiry);
      if (ssExp <= today) {
        alerts.push({ id: `al-${d.id}-ss`, type: 'danger', title: 'Seguridad social vencida', message: `Seguridad social de ${d.firstName} ${d.lastName} está vencida`, entity: 'driver', entityId: d.id, expiryDate: d.socialSecurityExpiry, daysRemaining: 0, read: false });
      } else if (ssExp <= threshold30) {
        const days = Math.ceil((ssExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({ id: `al-${d.id}-ss-w`, type: 'warning', title: 'Seguridad social próxima a vencer', message: `Seg. social de ${d.firstName} ${d.lastName} vence en ${days} días`, entity: 'driver', entityId: d.id, expiryDate: d.socialSecurityExpiry, daysRemaining: days, read: false });
      }
    });
  }

  if (data.vehicles) {
    data.vehicles.forEach(v => {
      const checks = [
        { date: v.soatExpiry, name: 'SOAT' },
        { date: v.technicalReviewExpiry, name: 'Tecno-mecánica' },
        { date: v.operationCardExpiry, name: 'Tarjeta de operación' },
        { date: v.rccExpiry, name: 'RCC' },
        { date: v.rceExpiry, name: 'RCE' },
      ];
      checks.forEach(check => {
        const exp = new Date(check.date);
        if (exp <= today) {
          alerts.push({ id: `al-${v.id}-${check.name}`, type: 'danger', title: `${check.name} vencido`, message: `${check.name} del vehículo ${v.plate} está vencido`, entity: 'vehicle', entityId: v.id, expiryDate: check.date, daysRemaining: 0, read: false });
        } else if (exp <= threshold30) {
          const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          alerts.push({ id: `al-${v.id}-${check.name}-w`, type: 'warning', title: `${check.name} próximo a vencer`, message: `${check.name} del vehículo ${v.plate} vence en ${days} días`, entity: 'vehicle', entityId: v.id, expiryDate: check.date, daysRemaining: days, read: false });
        }
      });
    });
  }

  return alerts;
}

function getDefaultData(): AppData {
  const data: AppData = {
    users: defaultUsers,
    currentUser: defaultUsers[0],
    drivers: defaultDrivers,
    vehicles: defaultVehicles,
    passengers: defaultPassengers,
    companies: defaultCompanies,
    rates: defaultRates,
    services: defaultServices,
    statusHistory: defaultStatusHistory,
    alerts: [],
    auditLogs: [],
    municipalities,
  };
  data.alerts = generateAlerts(data);
  return data;
}

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.alerts = generateAlerts(parsed);
      return parsed;
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  return getDefaultData();
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getData(): AppData {
  return loadData();
}

export function saveAppData(data: AppData) {
  saveData(data);
}

export function resetData(): AppData {
  const data = getDefaultData();
  saveData(data);
  return data;
}

export function addAuditLog(data: AppData, action: string, entity: string, entityId: string, prev: string, newD: string) {
  const log: AuditLog = {
    id: `log-${Date.now()}`,
    userId: data.currentUser.id,
    userName: data.currentUser.name,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    action,
    entity,
    entityId,
    previousData: prev,
    newData: newD,
  };
  data.auditLogs.unshift(log);
  return data;
}

export { municipalities };
