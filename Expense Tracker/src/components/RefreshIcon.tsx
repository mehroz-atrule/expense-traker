import React from 'react';

const ApprovalIcon = ({ 
  size = 24, 
  color = "#22c55e", 
  className = "" 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`approval-icon ${className}`}
      style={{ 
        cursor:  'pointer',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {/* Checkmark inside circle */}
      <circle cx="12" cy="12" r="10" fill={color} />
      <path
        d="M9 12L11 14L15 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ApprovalIcon;