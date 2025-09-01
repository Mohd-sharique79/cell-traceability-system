import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BarChart3, Calendar, User, CheckCircle, XCircle, Download } from 'lucide-react';
import axios from 'axios';

const Reports = () => {
  const [validationSessions, setValidationSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  useEffect(() => {
    // For demo purposes, we'll create some sample data
    // In a real implementation, you'd fetch this from the API
    const sampleSessions = [
      {
        session_id: 'session-001',
        kit_serial_number: 'KIT-2024-001',
        operator_name: 'John Smith',
        status: 'completed',
        started_at: '2024-01-15T09:30:00Z',
        completed_at: '2024-01-15T10:15:00Z',
        total_cells: 16,
        valid_scans: 16,
        invalid_scans: 0
      },
      {
        session_id: 'session-002',
        kit_serial_number: 'KIT-2024-002',
        operator_name: 'Jane Doe',
        status: 'completed',
        started_at: '2024-01-15T11:00:00Z',
        completed_at: '2024-01-15T11:45:00Z',
        total_cells: 16,
        valid_scans: 15,
        invalid_scans: 1
      },
      {
        session_id: 'session-003',
        kit_serial_number: 'KIT-2024-003',
        operator_name: 'Mike Johnson',
        status: 'in_progress',
        started_at: '2024-01-15T14:00:00Z',
        completed_at: null,
        total_cells: 16,
        valid_scans: 8,
        invalid_scans: 2
      }
    ];
    
    setValidationSessions(sampleSessions);
    setLoading(false);
  }, []);

  const handleViewSessionDetails = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getSessionDuration = (startedAt, completedAt) => {
    if (!startedAt || !completedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    return `${diffMins} minutes`;
  };

  const getSuccessRate = (validScans, totalCells) => {
    if (totalCells === 0) return 0;
    return Math.round((validScans / totalCells) * 100);
  };

  const exportReport = (session) => {
    // In a real implementation, this would generate and download a report
    const reportData = {
      sessionId: session.session_id,
      kitSerialNumber: session.kit_serial_number,
      operatorName: session.operator_name,
      startTime: formatDate(session.started_at),
      endTime: formatDate(session.completed_at),
      duration: getSessionDuration(session.started_at, session.completed_at),
      totalCells: session.total_cells,
      validScans: session.valid_scans,
      invalidScans: session.invalid_scans,
      successRate: getSuccessRate(session.valid_scans, session.total_cells)
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${session.session_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
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
            <BarChart3 className="h-5 w-5 mr-2" />
            Validation Reports
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            View validation session history and generate traceability reports
          </p>
        </div>
        
        <div className="p-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                  <p className="text-2xl font-semibold text-blue-900">{validationSessions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {validationSessions.filter(s => s.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">In Progress</p>
                  <p className="text-2xl font-semibold text-yellow-900">
                    {validationSessions.filter(s => s.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Unique Operators</p>
                  <p className="text-2xl font-semibold text-purple-900">
                    {new Set(validationSessions.map(s => s.operator_name)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kit Serial Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validationSessions.map((session) => (
                  <tr key={session.session_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {session.session_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {session.kit_serial_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.operator_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${getSuccessRate(session.valid_scans, session.total_cells)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {getSuccessRate(session.valid_scans, session.total_cells)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSessionDuration(session.started_at, session.completed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewSessionDetails(session)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => exportReport(session)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Session Details: {selectedSession.session_id}
                </h3>
                <button
                  onClick={() => setShowSessionDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Session Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Session Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Session ID:</span>
                      <p className="font-mono font-medium">{selectedSession.session_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Kit Serial Number:</span>
                      <p className="font-mono font-medium">{selectedSession.kit_serial_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Operator:</span>
                      <p className="font-medium">{selectedSession.operator_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{selectedSession.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Started:</span>
                      <p className="font-medium">{formatDate(selectedSession.started_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Completed:</span>
                      <p className="font-medium">{formatDate(selectedSession.completed_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium">{getSessionDuration(selectedSession.started_at, selectedSession.completed_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <p className="font-medium">{getSuccessRate(selectedSession.valid_scans, selectedSession.total_cells)}%</p>
                    </div>
                  </div>
                </div>

                {/* Validation Statistics */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{selectedSession.total_cells}</div>
                      <div className="text-sm text-gray-600">Total Cells</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{selectedSession.valid_scans}</div>
                      <div className="text-sm text-gray-600">Valid Scans</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{selectedSession.invalid_scans}</div>
                      <div className="text-sm text-gray-600">Invalid Scans</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => exportReport(selectedSession)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
                <button
                  onClick={() => setShowSessionDetails(false)}
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

export default Reports;
