import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import type { Expense } from "../../redux/submitter/submitterSlice";

interface ExpenseDetailViewProps {
  expense: Expense;
  onBack: () => void;
  showInternalStatus?: boolean; // when false, component will not render its own status block
}

const ExpenseDetailView: React.FC<ExpenseDetailViewProps> = ({ expense, onBack, showInternalStatus = true }) => {
  const [formData, setFormData] = useState({
    vendor: expense.vendor,
    category: expense.category || "General",
    date: expense.expenseDate || new Date().toISOString().split('T')[0],
    paymentMethod: expense.paymentMethod || "Credit Card",
    description: expense.description || "",
    amount: expense.amount,
  });

  const statusSteps = [
    { key: "New", label: "New" },
    { key: "WaitingForApproval", label: "Waiting" },
    { key: "Approved", label: "Approved" },
    { key: "InReviewByFinance", label: "In Review" },
    { key: "Paid", label: "Paid" },
  ];

  const getStatusIndex = (status: string) => statusSteps.findIndex(step => step.key === status);
  const currentStatusIndex = getStatusIndex(expense.status || '');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          className="text-gray-600 text-lg p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={onBack}
        >
          <ChevronLeft size={35} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-gray-800">Expense Details</h1>
        <div className="w-8" />
      </div>

      {/* Receipt Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Receipt</h2>
        <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-indigo-100 rounded-lg flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm font-medium">Receipt Preview</p>
          <p className="text-xs text-gray-400 mt-1">Click to view full image</p>
        </div>
      </div>

      {/* Expense Details Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Expense Information</h2>
        
        <form className="space-y-4">
          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input type="text" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500">$</span></div>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" step="0.01" />
            </div>
          </div>

          {/* Category and Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                <option value="General">General</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Supplies">Supplies</option>
                <option value="Software">Software</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent">
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Digital Wallet">Digital Wallet</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none" placeholder="Add additional details about this expense..." />
          </div>
        </form>
      </div>

      {showInternalStatus && (
        <>
          {/* Status Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Status Tracking</h2>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200">
                <div className="h-0.5 bg-green-500 transition-all duration-300" style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }} />
              </div>

              {/* Steps */}
              <div className="flex justify-between relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary-600 text-white border-2 border-primary-600' : 'bg-gray-200 text-gray-500 border-2 border-gray-300'}`}>
                        {isCompleted ? <span className="text-xs">✓</span> : <span className="text-xs">{index + 1}</span>}
                      </div>
                      <span className={`text-xs font-medium text-center max-w-16 ${isCompleted || isCurrent ? 'text-gray-800' : 'text-gray-500'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Status Display */}
            <div className="mt-6 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-800">Current Status</p>
                  <p className="text-lg font-semibold text-primary-900 capitalize">{(expense.status || '').replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
                <div className="px-3 py-1 bg-primary-100 rounded-full">
                  <span className="text-sm font-medium text-primary-700">Step {currentStatusIndex + 1} of {statusSteps.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors">Save Changes</button>
            <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">Update Status</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseDetailView;