import React from "react";
import Select from "react-select";
import type { Option } from "../../types";

interface CustomSelectProps {
  label?: string;
  options: Option[];
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;

  /** ✅ New optional styling props */
  className?: string; // wrapper div class
  selectClassName?: string; // select element class
  labelClassName?: string; // label class
  containerClassName?: string; // outer container
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
}

const SelectDropdown: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  className = "",
  selectClassName = "",
  labelClassName = "",
  containerClassName = "",
  isSearchable = true,
  isClearable = false,
  isDisabled = false,
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div className={className}>
        <Select
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          isSearchable={isSearchable}
          isClearable={isClearable}
          isDisabled={isDisabled}
          className={`text-sm ${selectClassName}`}
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
              borderRadius: "0.5rem",
              minHeight: "42px",
              boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : "none",
              "&:hover": { borderColor: "#3B82F6" },
            }),
            placeholder: (base) => ({
              ...base,
              color: "#9CA3AF", // Tailwind gray-400
            }),
            singleValue: (base) => ({
              ...base,
              color: "#111827", // Tailwind gray-900
            }),
          }}
        />
      </div>
    </div>
  );
};

export default SelectDropdown;
