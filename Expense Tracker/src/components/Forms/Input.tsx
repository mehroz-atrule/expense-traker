// components/CustomInputField.tsx
import React from 'react';

interface CustomInputFieldProps {
  // Basic input props
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel' | 'url';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  label?: string;
  name?: string;
  id?: string;
  
  // Validation props
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  pattern?: string;
  
  // Event handlers
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  // Custom styling
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
  
  // Additional attributes
  autoComplete?: string;
  autoFocus?: boolean;
}

const Input: React.FC<CustomInputFieldProps> = ({
  type = 'text',
  value,
  defaultValue,
  placeholder,
  label,
  name,
  id,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  step,
  pattern,
  onChange,
  onBlur,
  onFocus,
  className = '',
  inputClassName = '',
  labelClassName = '',
  containerClassName = '',
  autoComplete,
  autoFocus = false,
  ...restProps
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value, event);
    }
  };

const baseInputClasses = `w-full p-3 pl-0 border-gray-300 border-b focus:outline-none focus:border-b focus:border-gray-600 transition-colors duration-200 min-h-[42px] ${
  disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'
} ${readOnly ? 'bg-gray-50' : ''}`;

 
  return (
    <div className={` ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id} 
          className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={className}>
        <input
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          name={name}
          id={id}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`${baseInputClasses} ${inputClassName}`}
          {...restProps}
        />
      </div>
    </div>
  );
};

export default Input;