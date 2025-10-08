import React from 'react';

interface Office { _id: string; name: string }

interface OfficeSelectProps {
  value: string;
  onChange: (value: string) => void;
  offices: Office[];
  label?: string;
  className?: string;
}

const OfficeSelect: React.FC<OfficeSelectProps> = ({ value, onChange, offices, label = 'Office', className }) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border p-2 rounded">
        <option value="">Select Office</option>
        {offices?.map((o) => (
          <option key={o._id} value={o._id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
};

export default OfficeSelect;


