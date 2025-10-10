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
   WHT?: number; // Auto-filled from selected vendor (Withholding Tax)
  advanceTax?: number;
    amountAfterTax?: number; // NEW FIELD
     chequeImage?: File | null;    // Issued Cheque
  paymentSlip?: File | null;

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
      chequeImage: null,
  paymentSlip: null,
      WHT: 0,
  advanceTax: 0,
    amountAfterTax: 0, // NEW

  });

  const [preview, setPreview] = useState<string | null>(null);
  const [chequePreview, setChequePreview] = useState<string | null>(null);
const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null);
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
    'ReadyForPayment',
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

  // populate form if viewing
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
       setChequePreview((viewExpense as any).chequeImage || null);
    setPaymentSlipPreview((viewExpense as any).paymentSlip || null);
    }
  }, [viewExpense]);

  // Handle file upload
const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "image" | "cheque" | "paymentSlip") => {
  const file = e.target.files?.[0] || null;
  if (!file) return;

  const url = URL.createObjectURL(file);

  setFormData(prev => {
    const updated = { ...prev };
    if (type === "image") updated.image = file;
    else if (type === "cheque") updated.chequeImage = file;
    else updated.paymentSlip = file;
    return updated;
  });

  // set preview for the right type
  if (type === "image") {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);
  } else if (type === "cheque") {
    if (chequePreview) URL.revokeObjectURL(chequePreview);
    setChequePreview(url);
  } else {
    if (paymentSlipPreview) URL.revokeObjectURL(paymentSlipPreview);
    setPaymentSlipPreview(url);
  }
};



  // Generic field change handler
const handleChange = (field: keyof FormData, value: string | number | boolean) => {
  setFormData(prev => {
    const updated: any = { ...prev, [field]: value };

    // when vendor changes -> auto fill WHT
    if (field === "vendor") {
      const selectedVendor = vendors.find(v => v._id === value);
      if (selectedVendor) updated.WHT = Number((selectedVendor as any).WHT ?? (selectedVendor as any).Tax) || 0;
    }

    // calculate amountAfterTax
    const amountNum = parseFloat(String(updated.amount || "0")) || 0;
    const advanceTaxNum = parseFloat(String(updated.advanceTax || "0")) || 0;
    const taxNum = parseFloat(String(updated.WHT || "0")) || 0;

    const base = amountNum - advanceTaxNum;
    const total = base + (base * (taxNum / 100));
    updated.amountAfterTax = Number(total.toFixed(2));

    return updated;
  });
};

useEffect(() => {
  if (viewExpense) {
    console.log("📸 Backend images:", {
      image: viewExpense.image,
      chequeImage: viewExpense.chequeImage,
      paymentSlip: viewExpense.paymentSlip,
    });
  }
}, [viewExpense]);

  // Submit handler (with file upload support)
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
  WHT: formData.WHT != null ? String(formData.WHT) : "0",
  advanceTax: formData.advanceTax != null ? Number(formData.advanceTax) : 0,
  amountAfterTax: formData.amountAfterTax != null ? String(formData.amountAfterTax) : "0",

  // Send existing server URLs (if any) so backend knows not to null them
  image: viewExpense?.image || undefined,           // server URL (optional)
  chequeImage: viewExpense?.chequeImage || undefined,
  paymentSlip: viewExpense?.paymentSlip || undefined,
};


    console.log("Submitting expense with payload:", payload);
    
    let dataToSend: any = payload;
 // Build FormData if any image is attached
if (formData.image || formData.chequeImage || formData.paymentSlip) {
  const form = new FormData();

  // Append all normal fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, value as any);
    }
  });

  // Append individual images
  if (formData.image) form.append("image", formData.image);
  if (formData.chequeImage) form.append("chequeImage", formData.chequeImage);
  if (formData.paymentSlip) form.append("paymentSlip", formData.paymentSlip);

  dataToSend = form;
}

    if (viewExpense?._id) {
      dispatch(UpdateExpense({ id: viewExpense._id, payload: dataToSend }));
    } else {
      dispatch(createExpense(dataToSend));
    }
  };

  // Delete logic
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

     {/* ================= Image Upload Section ================= */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
  <h3 className="font-semibold text-gray-700 text-sm">Upload Documents</h3>

  {/* Expense Receipt - Always visible */}
  <div className="flex flex-col items-start gap-2">
    <p className="text-xs font-medium text-gray-600">Expense Receipt</p>
    <div
      onClick={() => (!isViewMode || isEditing) && document.getElementById("expenseUpload")?.click()}
      className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition"
    >
      {preview ? (
        <img
          src={preview}
          alt="Expense Receipt"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="flex flex-col items-center text-gray-400 text-xs">
          <Upload size={20} />
          <span>Upload</span>
        </div>
      )}
    </div>
    <input
      id="expenseUpload"
      type="file"
      accept="image/*,application/pdf"
      className="hidden"
      disabled={isViewMode && !isEditing}
      onChange={(e) => handleFileChange(e, "image")}
    />
  </div>

  {/* Issued Cheque - visible when InReviewByFinance or later */}
 {/* Issued Cheque - visible and editable only when InReviewByFinance or later */}
{(currentStatusKey === "InReviewByFinance" ||
  currentStatusKey === "ReadyForPayment" ||
  currentStatusKey === "Paid") && (
  <div className="flex flex-col items-start gap-2">
    <p className="text-xs font-medium text-gray-600">Issued Cheque</p>
    <div
      onClick={() =>
        currentStatusKey === "InReviewByFinance" ||
        currentStatusKey === "ReadyForPayment" ||
        currentStatusKey === "Paid"
          ? document.getElementById("chequeUpload")?.click()
          : null
      }
      className={`relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition ${
        currentStatusKey !== "InReviewByFinance" &&
        currentStatusKey !== "ReadyForPayment" &&
        currentStatusKey !== "Paid"
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >
      {chequePreview ? (
        <img
          src={chequePreview}
          alt="Issued Cheque"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="flex flex-col items-center text-gray-400 text-xs">
          <Upload size={20} />
          <span>Upload</span>
        </div>
      )}
    </div>
    <input
      id="chequeUpload"
      type="file"
      accept="image/*,application/pdf"
      className="hidden"
      disabled={
        !(
          currentStatusKey === "InReviewByFinance" ||
          currentStatusKey === "ReadyForPayment" ||
          currentStatusKey === "Paid"
        )
      }
      onChange={(e) => handleFileChange(e, "cheque")}
    />
  </div>
)}


  {/* Payment Slip - visible when ReadyForPayment or Paid */}
{/* Payment Slip */}
{(currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid") && (
  <div className="flex flex-col items-start gap-2">
    <p className="text-xs font-medium text-gray-600">Paid Receipt / Payment Slip</p>
    <div
      onClick={() =>
        (currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid") &&
        document.getElementById("paymentSlipUpload")?.click()
      }
      className={`relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 transition ${
        !(currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid")
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >
      {paymentSlipPreview ? (
        <img
          src={paymentSlipPreview}
          alt="Payment Slip"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        <div className="flex flex-col items-center text-gray-400 text-xs">
          <Upload size={20} />
          <span>Upload</span>
        </div>
      )}
    </div>
    <input
      id="paymentSlipUpload"
      type="file"
      accept="image/*,application/pdf"
      className="hidden"
      disabled={!(currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid")}
      onChange={(e) => handleFileChange(e, "paymentSlip")}
    />
  </div>
)}

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
   <Input
  label="WHT (%)"
  type="number"
  value={formData.WHT === 0 || formData.WHT == null ? "" : formData.WHT.toString()}
  onChange={(val) => handleChange("WHT", val)}
  placeholder="Auto-filled from vendor"
  disabled={isViewMode && !isEditing}
  readOnly={isViewMode && !isEditing}
/>

<Input
  label="Advance Tax"
  type="number"
  value={formData.advanceTax === 0 || formData.advanceTax == null ? "" : formData.advanceTax.toString()}
  onChange={(val) => handleChange("advanceTax", val)}
  placeholder="Enter advance tax amount"
  disabled={isViewMode && !isEditing}
  readOnly={isViewMode && !isEditing}
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
            isDisabled={isViewMode && !isEditing}
          />
<Input
  label="Amount After Tax"
  type="number"
  value={formData.amountAfterTax?.toString() || ""}
  placeholder="Auto-calculated amount"
  disabled
  readOnly
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
  <div className="flex gap-2">
    {/* Approve Button */}
    <button
      type="button"
      onClick={() => {
        // Create FormData to include status + cheque/payment slip files
        const form = new FormData();

        form.append("status", nextStatusKey);

        if (formData.chequeImage) {
          form.append("chequeImage", formData.chequeImage);
        }

        if (formData.paymentSlip) {
          form.append("paymentSlip", formData.paymentSlip);
        }

        dispatch(
          UpdateExpense({
            id: viewExpense._id as string,
            payload: form, // send as FormData
          })
        );
      }}
      className="bg-green-600 hover:bg-green-700 text-white px-4 xs:px-5 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors w-full xs:w-auto"
    >
      Approve
    </button>

    {/* Reject Button */}
    <button
      type="button"
      onClick={() =>
        dispatch(
          UpdateExpense({
            id: viewExpense._id as string,
            payload: { status: 'Rejected' },
          })
        )
      }
      className="bg-red-600 hover:bg-red-700 text-white px-4 xs:px-5 py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors w-full xs:w-auto"
    >
      Reject
    </button>
  </div>
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