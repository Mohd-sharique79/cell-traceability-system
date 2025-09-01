import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Factory, Package, CheckCircle, BarChart3 } from 'lucide-react';
import WarehouseAllocation from './components/WarehouseAllocation';
import ManufacturingValidation from './components/ManufacturingValidation';
import KitManagement from './components/KitManagement';
import Reports from './components/Reports';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Factory className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Cell Traceability System
              </h1>
            </div>
            <nav className="flex space-x-8">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Package className="h-4 w-4 mr-2" />
                Warehouse
              </Link>
              <Link
                to="/validation"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Manufacturing
              </Link>
              <Link
                to="/kits"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Package className="h-4 w-4 mr-2" />
                Kit Management
              </Link>
              <Link
                to="/reports"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<WarehouseAllocation />} />
          <Route path="/validation" element={<ManufacturingValidation />} />
          <Route path="/kits" element={<KitManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
