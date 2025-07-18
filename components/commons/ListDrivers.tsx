/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import _ from 'lodash';
import React, { MouseEventHandler, useEffect, useState } from 'react';

interface OnClickProps {
  id?: string;
  style?: React.CSSProperties;
  className?: string;
  data?: any;
  items?: any[];
  onClickDriver?: MouseEventHandler<HTMLElement> | undefined;
  onClickEdit?: MouseEventHandler<HTMLElement> | undefined;
  onClickDelete?: MouseEventHandler<HTMLElement> | undefined;
  onClickRefresh?: MouseEventHandler<HTMLElement> | undefined;
}

// Driver Card Sub-component
const DriverCard: React.FC<{
  driver: any;
  onClickDriver?: MouseEventHandler<HTMLElement>;
  onClickEdit?: MouseEventHandler<HTMLElement>;
  onClickDelete?: MouseEventHandler<HTMLElement>;
}> = ({ driver, onClickDriver, onClickEdit, onClickDelete }) => {
  const safeDriver = driver ?? {};
  const firstName = _.get(safeDriver, 'first_name', '');
  const lastName = _.get(safeDriver, 'last_name', '');
  const fullName = `${firstName} ${lastName || ''}`.trim() || 'Unknown Driver';
  const email = _.get(safeDriver, 'email', 'No email');
  const status = _.get(safeDriver, 'status', 'unknown');
  const licensePoints = _.get(safeDriver, 'license_points', 0);
  const personalId = _.get(safeDriver, 'personal_id_number', 'N/A');
  const avatar = _.get(safeDriver, 'avatar', null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLicensePointsColor = (points: number) => {
    if (points >= 10) return 'text-green-600';
    if (points >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Driver Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
          {avatar ? (
            <img src={avatar} alt={fullName} className="w-full h-full rounded-full object-cover" />
          ) : (
            firstName.charAt(0).toUpperCase() || 'D'
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
          <p className="text-gray-600 text-sm">{email}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
        >
          {status.replace('-', ' ').toUpperCase()}
        </div>
      </div>

      {/* Driver Info */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Personal ID:</span>
          <span className="font-medium text-gray-900">{personalId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">License Points:</span>
          <span className={`font-bold ${getLicensePointsColor(licensePoints)}`}>
            {licensePoints}/12
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onClickDriver}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
        >
          View Details
        </button>
        <button
          onClick={onClickEdit}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={onClickDelete}
          className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Header Sub-component
const DriverListHeader: React.FC<{
  total?: number;
  currentPage?: number;
  maxPage?: number;
  loading?: boolean;
  onClickRefresh?: MouseEventHandler<HTMLElement>;
}> = ({ total = 0, currentPage = 1, maxPage = 1, loading = false, onClickRefresh }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 mt-1">
            Total: {total} drivers • Page {currentPage} of {maxPage}
          </p>
        </div>
        <button
          onClick={onClickRefresh}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  );
};

// Error Component
const ErrorMessage: React.FC<{
  message: string;
  onClickRetry?: MouseEventHandler<HTMLElement>;
}> = ({ message, onClickRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Drivers</div>
      <p className="text-red-700 mb-4">{message}</p>
      <button
        onClick={onClickRetry}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );
};

// Loading Component
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Loading drivers...</span>
    </div>
  );
};

// Main Component
const DriverList: React.FC<OnClickProps> = ({ id, style, className, data, items, ...props }) => {
  const [driverData, setDriverData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Access token not found. Please login first.');
      }

      const response = await fetch('https://car.blocktrend.xyz/api/driver/list', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDriverData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch drivers';
      setError(errorMessage);
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleRefresh = (event: React.MouseEvent) => {
    props.onClickRefresh?.(event);
    fetchDrivers();
  };

  const handleDriverClick = (driver: any) => (event: React.MouseEvent) => {
    props.onClickDriver?.(event);
    console.log('Driver selected:', driver);
  };

  const handleEditClick = (driver: any) => (event: React.MouseEvent) => {
    props.onClickEdit?.(event);
    console.log('Edit driver:', driver);
  };

  const handleDeleteClick = (driver: any) => (event: React.MouseEvent) => {
    props.onClickDelete?.(event);
    console.log('Delete driver:', driver);
  };

  const safeData = driverData ?? {};
  const drivers = _.get(safeData, 'data', []);
  const total = _.get(safeData, 'total', 0);
  const currentPage = _.get(safeData, 'currentPage', 1);
  const maxPage = _.get(safeData, 'maxPage', 1);

  return (
    <div id={id} style={style} className={`min-h-screen bg-gray-50 p-6 ${className ?? ''}`}>
      <div className="max-w-7xl mx-auto">
        <DriverListHeader
          total={total}
          currentPage={currentPage}
          maxPage={maxPage}
          loading={loading}
          onClickRefresh={handleRefresh}
        />

        {error ? (
          <ErrorMessage message={error} onClickRetry={handleRefresh} />
        ) : loading ? (
          <LoadingSpinner />
        ) : drivers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-lg mb-2">No drivers found</div>
            <p className="text-gray-400">There are currently no drivers in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver: any, index: number) => (
              <DriverCard
                key={_.get(driver, 'id', index)}
                driver={driver}
                onClickDriver={handleDriverClick(driver)}
                onClickEdit={handleEditClick(driver)}
                onClickDelete={handleDeleteClick(driver)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverList;
