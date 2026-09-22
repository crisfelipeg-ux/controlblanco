export type Role = 'admin' | 'operador' | 'consulta';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  email: string;
  active: boolean;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  idType: string;
  idNumber: string;
  phone: string;
  address: string;
  email: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  socialSecurityNumber: string;
  socialSecurityExpiry: string;
  vehiclePlate: string;
  status: 'active' | 'inactive';
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  class: string;
  year: number;
  color: string;
  internalNumber: string;
  operationCardNumber: string;
  operationCardExpiry: string;
  soatNumber: string;
  soatExpiry: string;
  technicalReviewNumber: string;
  technicalReviewExpiry: string;
  preventiveReviewExpiry: string;
  rccPolicy: string;
  rccExpiry: string;
  rcePolicy: string;
  rceExpiry: string;
  ownerName: string;
  ownerId: string;
  status: 'available' | 'assigned' | 'maintenance' | 'disabled';
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  idType: 'CC' | 'NIT' | 'CE' | 'PAS';
  idNumber: string;
  address: string;
  locality: string;
  phone: string;
  hasResponsible: boolean;
  responsibleName: string;
}

export interface ContractingCompany {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
  address: string;
  phone: string;
  contractObject: string;
  contractNumber: string;
}

export interface Rate {
  id: string;
  companyId: string;
  transferType: 'sencillo' | 'doble';
  municipality: string;
  value: number;
}

export type ServiceStatus = 'GENERADO' | 'PROGRAMADO' | 'EN PROCESO' | 'TERMINADO' | 'FALLIDO CON COBRO' | 'FALLIDO SIN COBRO';

export interface ServiceRoute {
  id: string;
  date: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  rate: number;
  distance: number;
  estimatedTime: number;
  status: string;
}

export interface Service {
  id: string;
  serviceNumber: string;
  createdAt: string;
  passengerId: string;
  companyId: string;
  totalValue: number;
  routeCount: number;
  mipresId: string;
  prescriptionNumber: string;
  consecutive: number;
  technology: string;
  deliveryNumber: string;
  status: ServiceStatus;
  driverId: string;
  vehicleId: string;
  routes: ServiceRoute[];
  observations: string;
}

export interface StatusHistory {
  id: string;
  serviceId: string;
  previousStatus: ServiceStatus;
  newStatus: ServiceStatus;
  date: string;
  time: string;
  userId: string;
  observation: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  entity: string;
  entityId: string;
  expiryDate: string;
  daysRemaining: number;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  action: string;
  entity: string;
  entityId: string;
  previousData: string;
  newData: string;
}

export interface Municipality {
  code: string;
  name: string;
  department: string;
}
