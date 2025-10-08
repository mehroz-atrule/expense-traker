import React from 'react';

interface VendorSkeletonProps {
  count?: number;
  viewMode?: 'table' | 'grid';
}

const VendorSkeleton: React.FC<VendorSkeletonProps> = ({ count = 3, viewMode = 'grid' }) => {
  const skeletons = Array(count).fill(0);

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
            
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="px-6 py-3 text-right">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skeletons.map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorSkeleton;