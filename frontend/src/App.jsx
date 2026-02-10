import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Tenants from './pages/Tenants';
import Billing from './pages/Billing';
import QuickCalc from './pages/QuickCalc';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<QuickCalc />} />
          {/* Hidden routes for now */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/quick-calc" element={<QuickCalc />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
