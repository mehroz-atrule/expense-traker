import React from "react";
import SelectDropdown from "../../components/Forms/SelectionDropDown";

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

  // 🧩 Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));

  // 🧩 Generate year options (current year ± 5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => ({
    value: (currentYear - 5 + i).toString(),
    label: (currentYear - 5 + i).toString(),
  }));

  const handleMonthChange = (month: string) => {
    onMonthChange(`${month}-${selectedYear}`);
  };

  const handleYearChange = (year: string) => {
    const month = selectedMonthNum.toString().padStart(2, "0");
    onMonthChange(`${month}-${year}`);
  };

  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap max-sm:hidden">
        Filter by Month:
      </label>

      <div className="flex items-center space-x-2">
        {/* Month Dropdown */}
        <div className="w-32">
          <SelectDropdown
            options={monthOptions}
            value={monthOptions.find(m => m.value === selectedMonthNum.toString().padStart(2, "0")) || null}
            onChange={(opt) => handleMonthChange(opt?.value || "01")}
            placeholder="Select Month"
          />
        </div>

        {/* Year Dropdown */}
        <div className="w-28">
          <SelectDropdown
            options={yearOptions}
            value={yearOptions.find(y => y.value === selectedYear.toString()) || null}
            onChange={(opt) => handleYearChange(opt?.value || currentYear.toString())}
            placeholder="Select Year"
          />
        </div>
      </div>
    </div>
  );
};

export default MonthFilter;