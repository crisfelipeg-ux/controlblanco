import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Passengers from './pages/Passengers';
import Companies from './pages/Companies';
import Rates from './pages/Rates';
import Services from './pages/Services';
import Scheduling from './pages/Scheduling';
import { AlertsPage, AuditPage } from './pages/AlertsAudit';
import { getData, saveAppData } from './store';
import { User, Driver, Vehicle, Passenger, ContractingCompany, Rate, Service, StatusHistory } from './types';

function App() {
  const [data, setData] = useState(getData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const handleSwitchUser = (user: User) => {
    setData({ ...data, currentUser: user });
  };

  const handleSaveDrivers = (drivers: Driver[]) => {
    setData({ ...data, drivers });
  };

  const handleSaveVehicles = (vehicles: Vehicle[]) => {
    setData({ ...data, vehicles });
  };

  const handleSavePassengers = (passengers: Passenger[]) => {
    setData({ ...data, passengers });
  };

  const handleSaveCompanies = (companies: ContractingCompany[]) => {
    setData({ ...data, companies });
  };

  const handleSaveRates = (rates: Rate[]) => {
    setData({ ...data, rates });
  };

  const handleSaveServices = (services: Service[], statusHistory: StatusHistory[]) => {
    setData({ ...data, services, statusHistory });
  };

  const alertCount = data.alerts.filter(a => a.type === 'danger').length;

  return (
    <BrowserRouter>
      <Layout
        currentUser={data.currentUser}
        onSwitchUser={handleSwitchUser}
        alertCount={alertCount}
        users={data.users}
      >
        <Routes>
          <Route path="/" element={
            <Dashboard
              services={data.services}
              drivers={data.drivers}
              vehicles={data.vehicles}
              alerts={data.alerts}
              companies={data.companies}
            />
          } />
          <Route path="/drivers" element={
            <Drivers
              drivers={data.drivers}
              currentUser={data.currentUser}
              onSave={handleSaveDrivers}
            />
          } />
          <Route path="/vehicles" element={
            <Vehicles
              vehicles={data.vehicles}
              currentUser={data.currentUser}
              onSave={handleSaveVehicles}
            />
          } />
          <Route path="/passengers" element={
            <Passengers
              passengers={data.passengers}
              currentUser={data.currentUser}
              onSave={handleSavePassengers}
            />
          } />
          <Route path="/companies" element={
            <Companies
              companies={data.companies}
              currentUser={data.currentUser}
              onSave={handleSaveCompanies}
            />
          } />
          <Route path="/rates" element={
            <Rates
              rates={data.rates}
              companies={data.companies}
              currentUser={data.currentUser}
              onSave={handleSaveRates}
            />
          } />
          <Route path="/services" element={
            <Services
              services={data.services}
              passengers={data.passengers}
              companies={data.companies}
              rates={data.rates}
              drivers={data.drivers}
              vehicles={data.vehicles}
              statusHistory={data.statusHistory}
              currentUser={data.currentUser}
              onSave={handleSaveServices}
            />
          } />
          <Route path="/scheduling" element={
            <Scheduling
              services={data.services}
              drivers={data.drivers}
              vehicles={data.vehicles}
              passengers={data.passengers}
              companies={data.companies}
              currentUser={data.currentUser}
              onSave={handleSaveServices}
            />
          } />
          <Route path="/alerts" element={<AlertsPage alerts={data.alerts} />} />
          <Route path="/audit" element={<AuditPage auditLogs={data.auditLogs} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
