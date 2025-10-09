"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft, Upload, MoreVertical } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ExpenseStatusTracker from "../../components/Status Tracker/StatusTracker";
import Input from "../../components/Forms/Input";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import type { Office, Option } from "../../types";
import type { Expense } from "../../types/expense";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createExpense, UpdateExpense, removeExpense } from "../../redux/submitter/submitterSlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import { listOffices } from "../../api/adminApi";
import type { RootState } from "../../app/store";
import { fetchVendors } from "../../redux/vendor/vendorSlice";

interface FormData {
  title: string;
  billDate: string;
  dueDate: string;
  paymentDate?: string;
  amount: string;
  category: string;
  office: string;
  vendor: string;
  payment: string;
  description: string;
  image?: File | null;
}

const CreateExpenseView: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    billDate: "",
    dueDate: "",
    paymentDate: "",
    amount: "",
    category: "",
    office: "",
    vendor: "",
    payment: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [vendorOptions, setVendorOptions] = useState<Option[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => (s as any)?.auth?.user?.role || "submitter");
  const vendors = useAppSelector((s: RootState) => s.vendor.vendors || []);

  const state = (location.state as { expense?: Expense } | null) || null;
  const viewExpense = state?.expense;
  const isViewMode = !!viewExpense;
  const canEdit = role === "admin" || role === "submitter";

  // Status flow utilities
  const STATUS_FLOW = [
    'WaitingForApproval',
    'Approved',
    'InReviewByFinance',
    'ReadyForpayment',
    'Paid',
  ] as const;

  const normalizeStatus = (s?: string) => (s || '')
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z]/g, '');

  const currentStatusKey = normalizeStatus(viewExpense?.status);
  const isRejected = (viewExpense?.status || '').toLowerCase() === 'rejected' || (viewExpense?.status || '').startsWith('Rejected@');
  const isPaid = currentStatusKey === 'Paid';
  const currentIndex = STATUS_FLOW.findIndex(k => k === currentStatusKey);
  const nextStatusKey = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : undefined;

  const categoryOptions: Option[] = [
    { value: "Travel", label: "Travel" },
    { value: "Food", label: "Food" },
    { value: "Office Supplies", label: "Office Supplies" }, 
  ];

  const paymentOptions: Option[] = [
    { value: "Cash", label: "Cash" },
    { value: "BankTransfer", label: "Bank Transfer" },
    { value: "Card", label: "Credit Card" },
    { value: "Cheque", label: "Cheque" },
  ];

  useEffect(() => {
    listOffices()
      .then((list: Office[]) => {
        const opts = (list || []).map((o: Office) => ({
          value: o._id || o.name,
          label: o.name,
        }));
        console.log("Fetched offices:", opts);
        setOfficeOptions(opts);
      })
      .catch(() => setOfficeOptions([]));

    dispatch(fetchVendors({}));
  }, []);

  useEffect(() => {
    const opts = vendors.map(v => ({ value: v._id, label: v.vendorName }));
    setVendorOptions(opts);
  }, [vendors]);

  // ✅ populate form if viewing
  useEffect(() => {
    if (viewExpense) {
      setFormData({
        title: viewExpense.title || "",
        billDate: viewExpense.billDate?.split("T")[0] || "",
        dueDate: viewExpense.dueDate?.split("T")[0] || "",
        paymentDate: viewExpense.paymentDate?.split("T")[0] || "",
        amount: viewExpense.amount ? String(viewExpense.amount) : "",
        category: viewExpense.category || "",
        office: viewExpense.office || "",
        vendor: viewExpense.vendor || "",
        payment: viewExpense.payment || "",
        description: viewExpense.description || "",
        image: null,
      });
      setPreview(viewExpense.image || null);
    }
  }, [viewExpense]);

  // ✅ Handle file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPreview(file ? URL.createObjectURL(file) : null);
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // ✅ Generic field change handler
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    console.log(`Field ${field} changed to`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Submit handler (with file upload support)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: Expense = {
      _id: viewExpense?._id,
      title: formData.title,
      vendor: formData.vendor,
      amount: formData.amount || "",
      category: formData.category,
      office: formData.office,
      payment: formData.payment,
      description: formData.description,
      billDate: formData.billDate ? new Date(formData.billDate).toISOString() : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : undefined, 
    };

    console.log("Submitting expense with payload:", payload);
    
    let dataToSend: any = payload;
    if (formData.image) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          form.append(key, value as any);
      });
      form.append("image", formData.image);
      dataToSend = form;
    }

    if (viewExpense?._id) {
      dispatch(UpdateExpense({ id: viewExpense._id, payload: dataToSend }));
    } else {
      dispatch(createExpense(dataToSend));
    }
  };

  // ✅ Delete logic
  const onDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    if (viewExpense?._id) {
      dispatch(removeExpense(viewExpense._id));
    }
    setConfirmOpen(false);
    navigate(-1);
  };
  const cancelDelete = () => setConfirmOpen(false);

  return (
    <div className="space-y-4 xs:space-y-6 px-3 xs:px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 xs:gap-2 text-xs xs:text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={14} className="xs:size-4" /> 
          <span className="whitespace-nowrap">Back</span>
        </button>

        {isViewMode && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              className="p-1.5 xs:p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Options"
            >
              <MoreVertical size={16} className="xs:size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 xs:mt-2 w-32 xs:w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  type="button"
                  onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs xs:text-sm hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full text-left px-3 py-2 text-xs xs:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Tracker */}
      {isViewMode && (
        <div className="px-1 xs:px-0">
          <ExpenseStatusTracker
            currentStatus={viewExpense?.status || "New"}
            reason={viewExpense?.title}
          />
        </div>
      )}

      {/* Image Upload Section */}
      <div className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 p-3 xs:p-4 sm:p-5 flex flex-col md:flex-row gap-4 xs:gap-5 sm:gap-6">
        <div
          onClick={() => {
            if (!isViewMode || isEditing)
              document.getElementById("imageUpload")?.click();
          }}
          className={`flex-shrink-0 w-full md:w-64 lg:w-72 h-48 xs:h-56 sm:h-64 md:h-72 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg ${
            isViewMode && !isEditing
              ? "cursor-default opacity-90"
              : "cursor-pointer text-gray-400 hover:text-blue-600 hover:border-blue-400"
          } relative overflow-hidden group transition-all duration-200`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Image Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              {!isViewMode || isEditing ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-xs xs:text-sm font-medium flex items-center gap-1 xs:gap-2">
                    <Upload size={14} className="xs:size-4" />
                    Change Image
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-3">
              <Upload size={20} className="xs:size-6 sm:size-7 mb-1 xs:mb-2" strokeWidth={1.5} />
              <p className="text-xs xs:text-sm font-medium text-gray-500">Upload Image</p>
              <p className="text-[10px] xs:text-xs text-gray-400 mt-0.5">(Click to browse file)</p>
            </div>
          )}
        </div>

        <input
          id="imageUpload"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isViewMode && !isEditing}
        />
      </div>

      {/* Expense Info Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg xs:rounded-xl shadow-sm border border-gray-200 p-3 xs:p-4 sm:p-5 space-y-4 xs:space-y-5 sm:space-y-6"
      >
        <h2 className="text-base xs:text-lg font-semibold text-gray-700">Expense Information</h2>

        {/* Perfect Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Full width on all screens */}
          <div className="md:col-span-2">
            <Input
              label="Expense Title"
              value={formData.title}
              onChange={(val) => handleChange("title", val)}
              placeholder="Enter expense title"
              disabled={isViewMode && !isEditing}
              readOnly={isViewMode && !isEditing}
            />
          </div>

          {/* Date fields - 2 per row on desktop, 1 per row on mobile */}
          <Input
            label="Bill Date"
            type="date"
            value={formData.billDate}
            onChange={(val) => handleChange("billDate", val)}
            disabled={isViewMode && !isEditing}
            readOnly={isViewMode && !isEditing}
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(val) => handleChange("dueDate", val)}
            disabled={isViewMode && !isEditing}
            readOnly={isViewMode && !isEditing}
          />

          <Input
            label="Payment Date (Optional)"
            type="date"
            value={formData.paymentDate}
            onChange={(val) => handleChange("paymentDate", val)}
            disabled={isViewMode && !isEditing}
            readOnly={isViewMode && !isEditing}
          />

          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(val) => handleChange("amount", val)}
            placeholder="Enter amount"
            disabled={isViewMode && !isEditing}
            readOnly={isViewMode && !isEditing}
          />

          {/* Dropdown fields - 2 per row on desktop, 1 per row on mobile */}
          <SelectDropdown
            label="Category"
            options={categoryOptions}
            value={
              formData.category
                ? categoryOptions.find((opt) => opt.value === formData.category) || null
                : null
            }
            onChange={(opt) => handleChange("category", opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />

          <SelectDropdown
            label="Office"
            options={officeOptions}
            value={
              formData.office
                ? officeOptions.find((opt) => opt.value === formData.office) || null
                : null
            }
            onChange={(opt) => handleChange("office", opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />

          <SelectDropdown 
            label="Vendor"
            options={vendorOptions} 
            value={
              formData.vendor
                ? vendorOptions.find((opt) => opt.value === formData.vendor) || null
                : null
            }
            onChange={(opt) => handleChange("vendor", opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />

          <SelectDropdown
            label="Payment Method"
            options={paymentOptions}
            value={
              formData.payment
                ? paymentOptions.find((opt) => opt.value === formData.payment) || null
                : null
            }
            onChange={(opt) => handleChange("payment", opt?.value || "")}
            isDisabled={isViewMode && !canEdit}
          />

          {/* Full width textarea */}
          <div className="md:col-span-2">
            <label className="text-xs xs:text-sm font-medium text-gray-700 block mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("description", e.target.value)
              }
              placeholder="Enter description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 xs:p-3 text-xs xs:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              disabled={isViewMode && !isEditing}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col xs:flex-row justify-between gap-3 pt-2">
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 w-full xs:w-auto">
            {isViewMode ? (
              <>
                {!isEditing && !isRejected && !isPaid && nextStatusKey && (
                  <button
                    type="button"
                    onClick={() => dispatch(UpdateExpense({ id: viewExpense._id as string, payload: { status: nextStatusKey } }))}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 xs:px-5 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors w-full xs:w-auto"
                  >
                    Approve
                  </button>
                )}
                {isEditing && (
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 xs:px-5 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors w-full xs:w-auto"
                  >
                    Update
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 xs:px-5 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors w-full xs:w-auto"
                >
                  Back
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 xs:px-5 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors w-full xs:w-auto"
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