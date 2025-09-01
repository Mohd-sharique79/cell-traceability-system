import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Play, Square, RotateCcw, Scan } from 'lucide-react';
import axios from 'axios';

const ManufacturingValidation = () => {
  const [kitSerialNumber, setKitSerialNumber] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [kitData, setKitData] = useState(null);
  const [scannedCells, setScannedCells] = useState([]);
  const [currentCellInput, setCurrentCellInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startValidationSession = async (e) => {
    e.preventDefault();
    
    if (!kitSerialNumber.trim() || !operatorName.trim()) {
      toast.error('Please enter both kit serial number and operator name');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, get kit details
      const kitResponse = await axios.get(`/api/kits/${kitSerialNumber.trim()}`);
      setKitData(kitResponse.data);
      
      // Start validation session
      const sessionResponse = await axios.post('/api/validation/start', {
        kitSerialNumber: kitSerialNumber.trim(),
        operatorName: operatorName.trim()
      });
      
      setSessionId(sessionResponse.data.sessionId);
      setIsSessionActive(true);
      setScannedCells([]);
      toast.success('Validation session started successfully!');
      
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(error.response?.data?.error || 'Failed to start validation session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellScan = async () => {
    if (!currentCellInput.trim() || !sessionId) {
      toast.error('Please enter a cell serial number');
      return;
    }
    
    if (scannedCells.some(cell => cell.serialNumber === currentCellInput.trim())) {
      toast.error('Cell already scanned');
      setCurrentCellInput('');
      return;
    }
    
    try {
      const response = await axios.post('/api/validation/scan', {
        sessionId,
        cellSerialNumber: currentCellInput.trim()
      });
      
      const newScannedCell = {
        serialNumber: currentCellInput.trim(),
        isValid: response.data.isValid,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setScannedCells([...scannedCells, newScannedCell]);
      
      if (response.data.isValid) {
        toast.success('✅ Cell validated successfully!');
      } else {
        toast.error('❌ Cell does not belong to this kit!');
      }
      
      setCurrentCellInput('');
      
    } catch (error) {
      console.error('Error scanning cell:', error);
      toast.error('Failed to validate cell');
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    
    try {
      await axios.post('/api/validation/complete', { sessionId });
      toast.success('Validation session completed successfully!');
      resetSession();
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setKitData(null);
    setScannedCells([]);
    setCurrentCellInput('');
    setIsSessionActive(false);
    setKitSerialNumber('');
    setOperatorName('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isSessionActive) {
      e.preventDefault();
      handleCellScan();
    }
  };

  const getValidationProgress = () => {
    if (!kitData) return 0;
    const validScans = scannedCells.filter(cell => cell.isValid).length;
    return (validScans / kitData.cells.length) * 100;
  };

  const isValidationComplete = () => {
    if (!kitData) return false;
    const validScans = scannedCells.filter(cell => cell.isValid).length;
    return validScans === kitData.cells.length;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Setup */}
      {!isSessionActive && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Start Validation Session
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Scan kit barcode and enter operator details to begin validation
            </p>
          </div>
          
          <form onSubmit={startValidationSession} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="kitSerialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Kit Serial Number *
                </label>
                <input
                  type="text"
                  id="kitSerialNumber"
                  value={kitSerialNumber}
                  onChange={(e) => setKitSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Scan kit barcode"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-2">
                  Operator Name *
                </label>
                <input
                  type="text"
                  id="operatorName"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter operator name"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Validation Session */}
      {isSessionActive && kitData && (
        <>
          {/* Session Header */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Scan className="h-5 w-5 mr-2" />
                    Validation Session Active
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Kit: {kitData.kit.kit_serial_number} | Operator: {operatorName}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={completeSession}
                    disabled={!isValidationComplete()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Complete
                  </button>
                  <button
                    onClick={resetSession}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Validation Progress</span>
                <span className="text-sm text-gray-500">
                  {scannedCells.filter(cell => cell.isValid).length} / {kitData.cells.length} cells
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getValidationProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Cell Scanning */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cell Scanning</h3>
              <p className="mt-1 text-sm text-gray-600">
                Scan each cell barcode to validate against the kit
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={currentCellInput}
                  onChange={(e) => setCurrentCellInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Scan cell barcode"
                  autoFocus
                />
                <button
                  onClick={handleCellScan}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center"
                >
                  <Scan className="h-4 w-4 mr-2" />
                  Scan
                </button>
              </div>

              {/* Expected Cells */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Expected Cells for Kit {kitData.kit.kit_serial_number}</h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {kitData.cells.map((cell, index) => {
                    const scannedCell = scannedCells.find(sc => sc.serialNumber === cell);
                    return (
                      <div
                        key={index}
                        className={`p-2 rounded border text-center text-sm font-mono ${
                          !scannedCell
                            ? 'bg-gray-100 border-gray-300 text-gray-500'
                            : scannedCell.isValid
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : 'bg-red-100 border-red-300 text-red-800'
                        }`}
                      >
                        {cell}
                        {scannedCell && (
                          <div className="mt-1">
                            {scannedCell.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scan History */}
              {scannedCells.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Scan History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {scannedCells.map((cell, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded border ${
                          cell.isValid
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center">
                          {cell.isValid ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mr-3" />
                          )}
                          <span className="font-mono text-sm">{cell.serialNumber}</span>
                        </div>
                        <span className="text-xs text-gray-500">{cell.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManufacturingValidation;
