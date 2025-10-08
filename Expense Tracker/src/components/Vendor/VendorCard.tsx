import React from 'react';
import { MapPin, CreditCard, Building2 } from 'lucide-react';
import type { Vendor } from '../../types/vendor';

interface VendorCardProps {
  vendor: Vendor;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{vendor.vendorName}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} />
              <span>{vendor.location}</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          ID: {vendor.customerId}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <CreditCard size={14} className="text-gray-400" />
          <span className="text-gray-600">{vendor.preferredBankName}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Account:</span> {vendor.vendorAccountTitle}
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded">
          {vendor.vendorIban}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={onView}
          className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          View
        </button>
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default VendorCard;