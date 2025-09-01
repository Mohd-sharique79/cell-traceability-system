import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Package, Plus, Trash2, Save } from 'lucide-react';
import axios from 'axios';

const WarehouseAllocation = () => {
  const [kitSerialNumber, setKitSerialNumber] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [cellCount, setCellCount] = useState(16); // Default to 16 cells
  const [cellSerialNumbers, setCellSerialNumbers] = useState([]);
  const [currentCellInput, setCurrentCellInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCell = () => {
    if (!currentCellInput.trim()) {
      toast.error('Please enter a cell serial number');
      return;
    }
    
    if (cellSerialNumbers.includes(currentCellInput.trim())) {
      toast.error('Cell serial number already added');
      return;
    }
    
    setCellSerialNumbers([...cellSerialNumbers, currentCellInput.trim()]);
    setCurrentCellInput('');
  };

  const handleRemoveCell = (index) => {
    setCellSerialNumbers(cellSerialNumbers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!kitSerialNumber.trim()) {
      toast.error('Please enter a kit serial number');
      return;
    }
    
    if (!operatorName.trim()) {
      toast.error('Please enter operator name');
      return;
    }
    
    if (cellCount < 1 || cellCount > 100) {
      toast.error('Please enter a valid number of cells (1-100)');
      return;
    }
    
    if (cellSerialNumbers.length === 0) {
      toast.error('Please add at least one cell');
      return;
    }
    
    if (cellSerialNumbers.length !== cellCount) {
      toast.error(`Please allocate exactly ${cellCount} cells. Currently allocated: ${cellSerialNumbers.length}`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/kits', {
        kitSerialNumber: kitSerialNumber.trim(),
        cellSerialNumbers,
        operatorName: operatorName.trim()
      });
      
      toast.success(`Kit ${kitSerialNumber} allocated with ${cellSerialNumbers.length} cells successfully!`);
      
      // Reset form
      setKitSerialNumber('');
      setOperatorName('');
      setCellCount(16); // Reset to default
      setCellSerialNumbers([]);
      setCurrentCellInput('');
      
    } catch (error) {
      console.error('Error allocating kit:', error);
      toast.error(error.response?.data?.error || 'Failed to allocate kit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCell();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Warehouse Kit Allocation
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Allocate cells to kits for manufacturing traceability
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Kit Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                placeholder="Enter kit barcode"
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

            <div>
              <label htmlFor="cellCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cells *
              </label>
              <input
                type="number"
                id="cellCount"
                value={cellCount}
                onChange={(e) => {
                  const newCount = parseInt(e.target.value) || 1;
                  // Ensure minimum value of 1 and maximum of 100
                  const validCount = Math.max(1, Math.min(100, newCount));
                  setCellCount(validCount);
                  // Clear existing cells if new count is less than current
                  if (validCount < cellSerialNumbers.length) {
                    setCellSerialNumbers(cellSerialNumbers.slice(0, validCount));
                  }
                }}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter number of cells (1-100)"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter any number between 1 and 100 cells
              </p>
            </div>
          </div>
          
          {/* Cell Allocation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Cell Serial Numbers *
              </label>
              <span className={`text-sm font-medium ${
                cellSerialNumbers.length === cellCount 
                  ? 'text-green-600' 
                  : cellSerialNumbers.length > cellCount 
                    ? 'text-red-600' 
                    : 'text-gray-500'
              }`}>
                {cellSerialNumbers.length} / {cellCount} cells
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentCellInput}
                onChange={(e) => setCurrentCellInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Scan or enter cell barcode (${cellSerialNumbers.length}/${cellCount})`}
                disabled={cellSerialNumbers.length >= cellCount}
              />
              <button
                type="button"
                onClick={handleAddCell}
                disabled={cellSerialNumbers.length >= cellCount}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
            {cellSerialNumbers.length >= cellCount && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✅ All {cellCount} cells have been allocated!
              </p>
            )}
          </div>
          
          {/* Cell List */}
          {cellSerialNumbers.length > 0 && (
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Allocated Cells ({cellSerialNumbers.length}/{cellCount})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {cellSerialNumbers.map((cell, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded border"
                  >
                    <span className="text-sm font-mono text-gray-900">{cell}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCell(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || cellSerialNumbers.length === 0 || cellSerialNumbers.length !== cellCount}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Allocating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Allocate Kit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseAllocation;
