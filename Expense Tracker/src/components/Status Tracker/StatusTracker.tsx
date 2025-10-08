import React from "react";

interface ExpenseStatusTrackerProps {
  currentStatus: string;
  reason?: string;
}

const statusSteps = [
  { key: "New", label: "New" },
  { key: "WaitingForApproval", label: "Waiting" },
  { key: "Approved", label: "Approved" },
  { key: "InReviewByFinance", label: "In Review" },
  { key: "Paid", label: "Paid" },
];

const ExpenseStatusTracker: React.FC<ExpenseStatusTrackerProps> = ({
  currentStatus,
  reason,
}) => {
  const getStatusIndex = (status: string) =>
    statusSteps.findIndex((step) => step.key === status);

  const currentStatusIndex = getStatusIndex(currentStatus || "New");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Status Tracking</h2>

      {/* Progress Line */}
      <div className="relative mb-8">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-0.5 bg-green-500 transition-all duration-300"
            style={{
              width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="flex justify-between relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white border-2 border-blue-500"
                      : "bg-gray-200 text-gray-500 border-2 border-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <span className="text-xs">✓</span>
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center max-w-16 ${
                    isCompleted || isCurrent ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    

      {/* Reason Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Reason</h3>
        <p className="text-sm text-gray-600">
          {reason
            ? reason
            : "Expense created for travel, accommodation, and client meeting related costs."}
        </p>
      </div>
    </div>
  );
};

export default ExpenseStatusTracker;
