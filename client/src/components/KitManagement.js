import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Package, Search, Eye, Calendar, User } from 'lucide-react';
import axios from 'axios';

const KitManagement = () => {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKit, setSelectedKit] = useState(null);
  const [showKitDetails, setShowKitDetails] = useState(false);

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const response = await axios.get('/api/kits');
      setKits(response.data);
    } catch (error) {
      console.error('Error fetching kits:', error);
      toast.error('Failed to fetch kits');
    } finally {
      setLoading(false);
    }
  };

  const handleViewKitDetails = async (kitSerialNumber) => {
    try {
      const response = await axios.get(`/api/kits/${kitSerialNumber}`);
      setSelectedKit(response.data);
      setShowKitDetails(true);
    } catch (error) {
      console.error('Error fetching kit details:', error);
      toast.error('Failed to fetch kit details');
    }
  };

  const filteredKits = kits.filter(kit =>
    kit.kit_serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Kit Management
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all allocated kits and their cell mappings
          </p>
        </div>
        
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search kits by serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Kits Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kit Serial Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKits.map((kit) => (
                  <tr key={kit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {kit.kit_serial_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        kit.status === 'allocated' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {kit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(kit.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewKitDetails(kit.kit_serial_number)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredKits.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No kits found matching your search.' : 'No kits have been allocated yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kit Details Modal */}
      {showKitDetails && selectedKit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Kit Details: {selectedKit.kit.kit_serial_number}
                </h3>
                <button
                  onClick={() => setShowKitDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Kit Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Kit Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Serial Number:</span>
                      <p className="font-mono font-medium">{selectedKit.kit.kit_serial_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{selectedKit.kit.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium">{formatDate(selectedKit.kit.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <p className="font-medium">{formatDate(selectedKit.kit.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Allocated Cells */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Allocated Cells ({selectedKit.cells.length})
                  </h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {selectedKit.cells.map((cell, index) => (
                      <div
                        key={index}
                        className="bg-green-50 border border-green-200 rounded p-2 text-center"
                      >
                        <div className="text-xs font-mono text-green-800">{cell}</div>
                        <div className="text-xs text-green-600 mt-1">#{index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowKitDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitManagement;
