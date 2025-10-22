import React from "react";

interface MonthFilterProps {
  selectedMonth: string; // Format: "MM-YYYY"
  onMonthChange: (month: string) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ selectedMonth, onMonthChange }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // 🧩 Extract selected month/year from prop
  const [selectedMonthNum, selectedYear] = selectedMonth
    ? selectedMonth.split("-").map((v) => parseInt(v))
    : [currentDate.getMonth() + 1, currentYear];

  // 🧩 Generate month names
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));

  // 🧩 Generate year options (current year ± 5 years)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (month: string) => {
    onMonthChange(`${month}-${selectedYear}`);
  };

  const handleYearChange = (year: number) => {
    const month = selectedMonthNum.toString().padStart(2, "0");
    onMonthChange(`${month}-${year}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="month-filter"
        className="text-sm font-medium text-gray-700 whitespace-nowrap max-sm:hidden"
      >
        Filter by Month:
      </label>

      {/* Month Dropdown */}
      <select
        id="month-filter"
        value={selectedMonthNum.toString().padStart(2, "0")}
        onChange={(e) => handleMonthChange(e.target.value)}
        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
        className="block w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthFilter;
