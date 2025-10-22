import React from "react";

interface MonthYearPickerProps {
  selectedValue: string; // Format: "MM-YYYY"
  onValueChange: (value: string) => void;
  label?: string;
  className?: string;
  showLabel?: boolean;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  selectedValue,
  onValueChange,
  label = "Select Month",
  className = "",
  showLabel = true,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // 🧩 Extract selected month/year from prop
  const [selectedMonthNum, selectedYear] = selectedValue
    ? selectedValue.split("-").map((v) => parseInt(v))
    : [currentMonth, currentYear];

  // 🧩 Generate month names
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));

  // 🧩 Generate year options (current year ± 5 years)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (month: string) => {
    onValueChange(`${month}-${selectedYear}`);
  };

  const handleYearChange = (year: number) => {
    const month = selectedMonthNum.toString().padStart(2, "0");
    onValueChange(`${month}-${year}`);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Month Dropdown */}
        <select
          value={selectedMonthNum.toString().padStart(2, "0")}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="block w-32 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="block w-28 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthYearPicker;