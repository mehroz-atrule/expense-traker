"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate } from "react-router-dom";
import ExpenseStatusTracker from "../../components/Status Tracker/StatusTracker";
import Input from "../../components/Forms/Input";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import { Upload } from "lucide-react"; // 👈 Add this import at the top
import type { Expense } from "../../redux/submitter/submitterSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createExpense, updateExpense, removeExpense } from "../../redux/submitter/submitterSlice";
import { getOffices } from "../../api/submitterApi";
import ConfirmDialog from "../../components/ConfirmDialog";


interface Option {
  value: string;
  label: string;
}

interface FormData {
  title: string;
  date: string;
  amount: string;
  category: string;
  office: string;
  vendor: string;
  payment: string;
  budgetLink: string;
  description: string;
  hasBudgetLink: boolean;
}

const CreateExpenseView: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    date: "",
    amount: "",
    category: "",
    office: "",
    vendor: "",
    payment: "",
    budgetLink: "",
    description: "",
    hasBudgetLink: false,
  });

  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = useAppSelector(s => (s as any)?.auth?.user?.role || 'submitter');

  const state = (location.state as { expense?: Expense } | null) || null;
  const viewExpense = state?.expense;
  const isViewMode = !!viewExpense;
  const canEdit = (role === 'admin' || role === 'submitter');

  const categoryOptions: Option[] = [
    { value: "Travel", label: "Travel" },
    { value: "Food", label: "Food" },
    { value: "Office Supplies", label: "Office Supplies" },
  ];

  useEffect(() => {
    getOffices().then((list: any[]) => {
      const opts = (list || []).map((o: any) => ({ value: o.id || o.name, label: o.name }));
      setOfficeOptions(opts);
    }).catch(() => setOfficeOptions([]));
  }, []);

  const paymentOptions: Option[] = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Credit Card", label: "Credit Card" },
  ];

  React.useEffect(() => {
    if (viewExpense) {
      setFormData({
        title: viewExpense.title || "",
        date:
          viewExpense.expenseDate?.split("T")[0] ||
          (viewExpense.createdAt ? new Date(viewExpense.createdAt).toISOString().slice(0, 10) : ""),
        amount: viewExpense.amount ? String(viewExpense.amount) : "",
        category: viewExpense.category || "",
        office: viewExpense.officeId || "",
        vendor: viewExpense.vendor || "",
        payment: viewExpense.paymentMethod || "",
        budgetLink: viewExpense.linkedBudgetId || "",
        description: viewExpense.description || "",
        hasBudgetLink: Boolean(viewExpense.linkedBudgetId),
      });
      setPreview(viewExpense.receiptUrl || null);
    }
  }, [viewExpense]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setReceipt(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: Expense = {
      id: viewExpense?.id,
      title: formData.title,
      vendor: formData.vendor,
      amount: Number(formData.amount || 0),
      category: String(formData.category || ''),
      officeId: String(formData.office || ''),
      paymentMethod: String(formData.payment || ''),
      description: formData.description,
      linkedBudgetId: formData.hasBudgetLink ? String(formData.budgetLink || '') : undefined,
      expenseDate: formData.date ? new Date(formData.date).toISOString() : undefined,
    };

    if (viewExpense?.id) {
      dispatch(updateExpense({ id: viewExpense.id, payload })).then(() => navigate(-1));
    } else {
      dispatch(createExpense(payload)).then(() => navigate(-1));
    }
  };

  const canDelete = role === 'admin' || role === 'submitter';
  const onDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    if (viewExpense?.id) {
      dispatch(removeExpense(viewExpense.id));
    }
    setConfirmOpen(false);
    navigate(-1);
  };
  const cancelDelete = () => setConfirmOpen(false);


  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> Back
        </button>
      </div>
      {/* Show top status tracker only in view-mode */}
      {isViewMode && (
        <ExpenseStatusTracker currentStatus={viewExpense?.status || "New"} reason={viewExpense?.title} />
      )}


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
  <h2 className="text-lg font-semibold text-gray-700 mb-4">Receipt</h2>

  <div className="flex flex-col sm:flex-row gap-4 items-center">
    <div
      onClick={() => {
        if (!isViewMode || canEdit) document.getElementById("receiptUpload")?.click();
      }}
      className={`w-48 h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg ${isViewMode ? 'cursor-default opacity-90' : 'cursor-pointer text-gray-400 hover:text-blue-600 hover:border-blue-400'} transition-all duration-200 relative overflow-hidden group`}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="Receipt Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <Upload size={18} />
              Change Receipt
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center px-3">
          <Upload size={28} strokeWidth={1.5} className="mb-2" />
          <p className="text-sm font-medium text-gray-500">Upload Receipt</p>
          <p className="text-xs text-gray-400">(Click to browse file)</p>
        </div>
      )}
    </div>

    {/* Hidden File Input */}
    <input
      id="receiptUpload"
      type="file"
      accept="image/*,application/pdf"
      onChange={handleFileChange}
      className="hidden"
      disabled={isViewMode && !canEdit}
    />
  </div>
</div>


      {/* Expense Information */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-6"
      >
        <h2 className="text-lg font-semibold text-gray-700">
          Expense Information
        </h2>

        <div className="flex flex-col gap-6">
          {/* Title */}
          <Input
            label="Expense Title"
            value={formData.title}
            onChange={(val) => handleChange("title", val)}
            placeholder="Enter expense title"
            disabled={isViewMode && !canEdit}
            readOnly={isViewMode && !canEdit}
          />

          {/* Date + Amount */}
          <div className="flex w-full gap-5">
            <div className="flex-1">
              <Input
                label="Expense Date"
                type="date"
                value={formData.date}
                onChange={(val) => handleChange("date", val)}
                disabled={isViewMode && !canEdit}
                readOnly={isViewMode && !canEdit}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(val) => handleChange("amount", val)}
                placeholder="Enter amount"
                disabled={isViewMode && !canEdit}
                readOnly={isViewMode && !canEdit}
              />
            </div>
          </div>

          {/* Category + Office */}
          <div className="flex w-full gap-5">
            <div className="flex-1">
              <SelectDropdown
                label="Category"
                options={categoryOptions}
                value={
                  formData.category
                    ? categoryOptions.find(
                        (opt) => opt.value === formData.category
                      ) || null
                    : null
                }
                onChange={(opt) => handleChange("category", opt?.value || "")}
                isDisabled={isViewMode && !canEdit}
              />
            </div>
            <div className="flex-1">
              <SelectDropdown
                label="Office"
                options={officeOptions}
                value={
                  formData.office
                    ? officeOptions.find(
                        (opt) => opt.value === formData.office
                      ) || null
                    : null
                }
                onChange={(opt) => handleChange("office", opt?.value || "")}
                isDisabled={isViewMode && !canEdit}
              />
            </div>
          </div>

          {/* Vendor + Payment */}
          <div className="flex w-full gap-5">
            <div className="flex-1">
              <Input
                label="Vendor"
                value={formData.vendor}
                onChange={(val) => handleChange("vendor", val)}
                placeholder="Enter vendor name"
                disabled={isViewMode && !canEdit}
                readOnly={isViewMode && !canEdit}
              />
            </div>
            <div className="flex-1">
              <SelectDropdown
                label="Payment Method"
                options={paymentOptions}
                value={
                  formData.payment
                    ? paymentOptions.find(
                        (opt) => opt.value === formData.payment
                      ) || null
                    : null
                }
                onChange={(opt) => handleChange("payment", opt?.value || "")}
                isDisabled={isViewMode && !canEdit}
              />
            </div>
          </div>

          {/* Budget Link Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasBudgetLink"
              checked={formData.hasBudgetLink}
              onChange={(e) =>
                handleChange("hasBudgetLink", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isViewMode && !canEdit}
            />
            <label
              htmlFor="hasBudgetLink"
              className="text-sm font-medium text-gray-700"
            >
              Link to Budget
            </label>
          </div>
          <div>  
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("description", e.target.value)
              }
              placeholder="Enter description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isViewMode && !canEdit}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between">
          {isViewMode && canDelete ? (
            <button type="button" onClick={onDelete} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium">Delete</button>
          ) : <span />}
          <div>
            {isViewMode ? (
              <div className="flex gap-2">
                {canEdit && (
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">Update</button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Back
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                Save Expense
              </button>
            )}
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default CreateExpenseView;
