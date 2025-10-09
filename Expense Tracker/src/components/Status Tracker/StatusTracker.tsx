import React from "react";

interface ExpenseStatusTrackerProps {
  currentStatus: string;
  reason?: string;
}

const baseSteps = [
  { key: "WaitingForApproval", label: "Pending" },
  { key: "Approved", label: "Approved" },
  { key: "InReviewByFinance", label: "Finance Review" },
  { key: "ReadyForpayment", label: "Ready to Pay" },
  { key: "Paid", label: "Paid" },
];

const ExpenseStatusTracker: React.FC<ExpenseStatusTrackerProps> = ({
  currentStatus,
}) => {
  console.log("Rendering ExpenseStatusTracker with status:", currentStatus);
  const lowered = (currentStatus || '').toLowerCase();
  const isRejected = lowered === 'rejected' || currentStatus?.startsWith("Rejected@");
  const rejectionStage = currentStatus?.startsWith("Rejected@") ? currentStatus.split("@")[1] : null;

  const getStatusIndex = (status: string) =>
    baseSteps.findIndex((s) => s.key === status);

  const rejectionIndex = rejectionStage ? getStatusIndex(rejectionStage) : -1;

  const steps = [...baseSteps];
  if (isRejected && rejectionIndex >= 0) {
    steps.splice(rejectionIndex + 1, 0, { key: "Rejected", label: "Rejected" });
  }

  const currentIndex = isRejected
    ? Math.max(0, rejectionIndex) + 1
    : getStatusIndex(currentStatus || baseSteps[0].key);

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-100 p-3 sm:p-6 w-full max-w-xs xs:max-w-sm sm:max-w-full mx-auto">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-6 flex items-center gap-2">
        <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
        <span className="truncate">Expense Status</span>
      </h2>

      {/* Steps container */}
      <div className="relative">
        {/* Background line for desktop */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 h-0.5 sm:h-1 bg-gray-100 rounded-full hidden xs:block"></div>

        {/* Progress line for desktop */}
        <div
          className={`absolute top-3 sm:top-4 left-3 sm:left-4 h-0.5 sm:h-1 rounded-full transition-all duration-500 ease-out hidden xs:block ${
            isRejected ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-green-500"
          }`}
          style={{
            width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 1.5rem)`,
          }}
        ></div>

        {/* Mobile step connector lines - visible only on very small screens */}
        <div className="absolute top-3 left-6 right-6 h-0.5 bg-gray-100 xs:hidden"></div>
        
        {/* Mobile progress line */}
        <div
          className={`absolute top-3 left-6 h-0.5 transition-all duration-500 ease-out xs:hidden ${
            isRejected ? "bg-red-500" : "bg-green-500"
          }`}
          style={{
            width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 3rem)`,
          }}
        ></div>

        <div className="flex items-start justify-between relative gap-1">
          {steps.map((step, index) => {
            const isRejectedStep = step.key === "Rejected";
            const isCompleted = !isRejected && index <= currentIndex;
            const isCurrent = !isRejected && index === currentIndex;
            const isActive = isCompleted || isCurrent || isRejectedStep;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center flex-1 relative z-10 min-w-0"
              >
                {/* Step circle */}
                <div className="relative mb-1 sm:mb-2 md:mb-3">
                  <div
                    className={`w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                      isRejectedStep
                        ? "bg-red-500 border-red-600 shadow-md sm:shadow-lg shadow-red-200"
                        : isCompleted
                        ? "bg-green-500 border-green-600 shadow-md sm:shadow-lg shadow-green-200"
                        : isCurrent
                        ? "bg-blue-500 border-blue-600 shadow-md sm:shadow-lg shadow-blue-200 ring-2 sm:ring-3 md:ring-4 ring-blue-100"
                        : "bg-white border-gray-300"
                    } ${(isCurrent || isRejectedStep) ? 'scale-110' : ''}`}
                  >
                    <span className={`text-[10px] xs:text-xs font-bold ${
                      isRejectedStep || isCompleted || isCurrent ? "text-white" : "text-gray-400"
                    }`}>
                      {isRejectedStep ? "✗" : isCompleted ? "✓" : index + 1}
                    </span>
                  </div>
                  
                  {/* Pulse animation for current step */}
                  {isCurrent && !isRejected && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75 -z-10"></div>
                  )}
                </div>

                {/* Step label */}
                <div className="text-center px-0.5 w-12 xs:w-14 sm:w-16 md:w-20 min-w-0">
                  <span
                    className={`text-[9px] xs:text-[10px] sm:text-xs font-medium leading-tight block break-words hyphens-auto ${
                      isRejectedStep
                        ? "text-red-600"
                        : isActive
                        ? "text-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  
                  {/* Current status indicator */}
                  {isCurrent && !isRejected && (
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] text-blue-600 font-medium mt-0.5 block">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status summary */}
      <div className="mt-3 sm:mt-4 md:mt-6 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 sm:gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Current Status:</span>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                isRejected
                  ? "bg-red-100 text-red-800"
                  : currentIndex === steps.length - 1
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {isRejected ? "Rejected" : steps[currentIndex]?.label}
            </span>
            {isRejected && rejectionStage && (
              <span className="text-[10px] xs:text-xs text-gray-600 bg-gray-100 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded whitespace-nowrap">
                At: {baseSteps.find(s => s.key === rejectionStage)?.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseStatusTracker;