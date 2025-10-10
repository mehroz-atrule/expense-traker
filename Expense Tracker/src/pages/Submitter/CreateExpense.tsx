"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft, Upload, MoreVertical, FileText, Calendar, DollarSign, Building2, User, CreditCard, Edit3, Trash2 } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

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

  // Cancel logic
  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      // Reset form data to original values if editing
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
      }
    } else {
      navigate(-1);
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App-like Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 sm:px-3 sm:py-2 text-gray-600 bg-gray-50 sm:bg-white rounded-full sm:rounded-lg border-0 sm:border sm:border-gray-200 hover:bg-gray-100 sm:hover:bg-gray-50 transition-colors duration-200 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-sm">Back</span>
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {isViewMode 
                        ? (isEditing ? "Edit Expense" : "Expense Details")
                        : "Create New Expense"
                      }
                    </h1>
                    {isEditing && (
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                        <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                        <span className="hidden sm:inline">Editing Mode</span>
                        <span className="sm:hidden">Edit</span>
                      </span>
                    )}
                    {isPaid && (
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                        ✓ <span className="hidden sm:inline ml-1">Paid</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                        ✗ <span className="hidden sm:inline ml-1">Rejected</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {isViewMode 
                      ? (
                        <span className="block sm:hidden">ID: {viewExpense?._id?.slice(-6) || 'N/A'}</span>
                      ) : (
                        <span className="hidden sm:block">Fill in the details below</span>
                      )}
                    <span className="hidden sm:block">
                      {isViewMode ? `Expense ID: ${viewExpense?._id?.slice(-8) || 'N/A'} • Status: ${viewExpense?.status || 'Unknown'}` : "Fill in the details below"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {isViewMode && !isEditing && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(v => !v)}
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:p-2 text-gray-400 hover:text-gray-600 bg-gray-50 sm:bg-transparent rounded-full sm:rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                  aria-label="Options"
                >
                  <MoreVertical className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-40 bg-white border border-gray-200 rounded-xl sm:rounded-md shadow-lg z-50">
                    <div className="py-2">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 sm:px-3 sm:py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 sm:gap-2"
                      >
                        <Edit3 className="w-5 h-5 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="font-medium">Edit Expense</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onDelete(); }}
                        className="w-full text-left px-4 py-3 sm:px-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 sm:gap-2"
                      >
                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="font-medium">Delete Expense</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Tracker for View Mode */}
      {isViewMode && viewExpense && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <div className="overflow-x-auto">
              <ExpenseStatusTracker
                currentStatus={viewExpense?.status || "New"}
                reason={viewExpense?.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Document Upload Section */}
          <div className="bg-white rounded-2xl sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:border-l-4 sm:border-green-500 sm:pl-4">
                <div className="w-8 h-8 bg-green-100 rounded-full sm:hidden flex items-center justify-center">
                  <Upload className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Documents & Receipts</h3>
                  <p className="text-sm sm:text-xs text-gray-600">Upload bills, receipts, and supporting documents</p>
                </div>
              </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Expense Receipt */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500 sm:hidden" />
                  Expense Receipt
                </label>
                <div
                  onClick={() => (!isViewMode || isEditing) && document.getElementById("expenseUpload")?.click()}
                  className="relative w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 active:scale-[0.98]"
                >
                  {preview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={preview}
                        alt="Expense Receipt"
                        className="w-full h-full object-cover rounded-xl sm:rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-xl sm:rounded-lg"></div>
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <FileText className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 p-4">
                      <div className="w-12 h-12 sm:w-8 sm:h-8 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                        <Upload className="w-6 h-6 sm:w-4 sm:h-4 text-blue-500" />
                      </div>
                      <span className="text-sm font-medium text-center">Upload Receipt</span>
                      <span className="text-xs text-center mt-1">PNG, JPG, PDF</span>
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
              {(currentStatusKey === "InReviewByFinance" ||
                currentStatusKey === "ReadyForPayment" ||
                currentStatusKey === "Paid") && (
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-500 sm:hidden" />
                    Issued Cheque
                  </label>
                  <div
                    onClick={() =>
                      currentStatusKey === "InReviewByFinance" ||
                      currentStatusKey === "ReadyForPayment" ||
                      currentStatusKey === "Paid"
                        ? document.getElementById("chequeUpload")?.click()
                        : null
                    }
                    className={`relative w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-lg flex items-center justify-center transition-all duration-200 ${
                      currentStatusKey !== "InReviewByFinance" &&
                      currentStatusKey !== "ReadyForPayment" &&
                      currentStatusKey !== "Paid"
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-orange-400 hover:bg-orange-50 active:scale-[0.98]"
                    }`}
                  >
                    {chequePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={chequePreview}
                          alt="Issued Cheque"
                          className="w-full h-full object-cover rounded-xl sm:rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-xl sm:rounded-lg"></div>
                        <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <CreditCard className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 p-4">
                        <div className="w-12 h-12 sm:w-8 sm:h-8 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                          <CreditCard className="w-6 h-6 sm:w-4 sm:h-4 text-orange-500" />
                        </div>
                        <span className="text-sm font-medium text-center">Upload Cheque</span>
                        <span className="text-xs text-center mt-1">PNG, JPG, PDF</span>
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
              {(currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid") && (
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500 sm:hidden" />
                    Payment Receipt / Slip
                  </label>
                  <div
                    onClick={() =>
                      (currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid") &&
                      document.getElementById("paymentSlipUpload")?.click()
                    }
                    className={`relative w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-lg flex items-center justify-center transition-all duration-200 ${
                      !(currentStatusKey === "ReadyForPayment" || currentStatusKey === "Paid")
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-purple-400 hover:bg-purple-50 active:scale-[0.98]"
                    }`}
                  >
                    {paymentSlipPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={paymentSlipPreview}
                          alt="Payment Slip"
                          className="w-full h-full object-cover rounded-xl sm:rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-xl sm:rounded-lg"></div>
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 p-4">
                        <div className="w-12 h-12 sm:w-8 sm:h-8 bg-purple-50 rounded-full flex items-center justify-center mb-2">
                          <FileText className="w-6 h-6 sm:w-4 sm:h-4 text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-center">Upload Receipt</span>
                        <span className="text-xs text-center mt-1">PNG, JPG, PDF</span>
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
          </div>
        </div>

          {/* Expense Info Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6 sm:space-y-8"
          >
            {/* Basic Information Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:border-l-4 sm:border-blue-500 sm:pl-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full sm:hidden flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Basic Information</h3>
                  <p className="text-sm sm:text-xs text-gray-600">Expense title and description</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Expense Title"
                  value={formData.title}
                  onChange={(val) => handleChange("title", val)}
                  placeholder="Enter expense title"
                  disabled={isViewMode && !isEditing}
                  readOnly={isViewMode && !isEditing}
                />
              </div>
            </div>

            {/* Date Information Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:border-l-4 sm:border-indigo-500 sm:pl-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full sm:hidden flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Date Information</h3>
                  <p className="text-sm sm:text-xs text-gray-600">Bill date, due date, and payment date</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="sm:col-span-2 sm:max-w-sm">
                  <Input
                    label="Payment Date (Optional)"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(val) => handleChange("paymentDate", val)}
                    disabled={isViewMode && !isEditing}
                    readOnly={isViewMode && !isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Amount & Tax Information Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:border-l-4 sm:border-orange-500 sm:pl-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full sm:hidden flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Financial Details</h3>
                  <p className="text-sm sm:text-xs text-gray-600">Amount, taxes, and calculations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 sm:max-w-sm">
                  <Input
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(val) => handleChange("amount", val)}
                    placeholder="Enter amount"
                    disabled={isViewMode && !isEditing}
                    readOnly={isViewMode && !isEditing}
                  />
                </div>

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

                <div className="sm:col-span-2 sm:max-w-sm">
                  <Input
                    label="Amount After Tax"
                    type="number"
                    value={formData.amountAfterTax?.toString() || ""}
                    placeholder="Auto-calculated amount"
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Category & Details Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:border-l-4 sm:border-purple-500 sm:pl-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full sm:hidden flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Category & Details</h3>
                  <p className="text-sm sm:text-xs text-gray-600">Expense categorization and additional information</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    isDisabled={isViewMode && !isEditing}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Enter description"
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl sm:rounded-lg p-3 sm:p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                    disabled={isViewMode && !isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Mobile App-like Action Buttons */}
            <div className="space-y-3 sm:space-y-0">
              {/* Mobile: Full width buttons stacked */}
              <div className="sm:hidden space-y-3">
                {/* Approve/Reject buttons in view mode when applicable */}
                {isViewMode && !isEditing && !isRejected && !isPaid && nextStatusKey && (
                  <div className="grid grid-cols-2 gap-3">
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
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95 transition-all duration-200"
                    >
                      ✓ Approve
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
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95 transition-all duration-200"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}

                {/* Submit/Update button for editing or creating */}
                {(isEditing || !isViewMode) && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 text-base font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {isEditing ? (
                          <>
                            <Edit3 className="w-5 h-5" />
                            <span>Update Expense</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5" />
                            <span>Create Expense</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                )}

                {/* Edit button - only show if not paid and not rejected */}
                {isViewMode && !isEditing && !isPaid && !isRejected && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Expense
                  </button>
                )}

                {/* Status indicators */}
                {isViewMode && !isEditing && isPaid && (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-xl">
                    <FileText className="w-4 h-4" />
                    Expense Paid (Read Only)
                  </div>
                )}

                {isViewMode && !isEditing && isRejected && (
                  <div className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-xl">
                    <FileText className="w-4 h-4" />
                    Expense Rejected (Read Only)
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 active:scale-95 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isEditing ? "Cancel Changes" : "Cancel"}
                </button>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden sm:flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isEditing ? "Cancel Changes" : "Cancel"}
                </button>

                {/* Approve/Reject buttons in view mode when applicable */}
                {isViewMode && !isEditing && !isRejected && !isPaid && nextStatusKey && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
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
                            payload: form,
                          })
                        );
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
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
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {isViewMode && !isEditing && !isPaid && !isRejected ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Expense
                  </button>
                ) : isViewMode && !isEditing && isPaid ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                    <FileText className="w-4 h-4" />
                    Expense Paid (Read Only)
                  </div>
                ) : isViewMode && !isEditing && isRejected ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg cursor-not-allowed">
                    <FileText className="w-4 h-4" />
                    Expense Rejected (Read Only)
                  </div>
                ) : null}

                {(isEditing || !isViewMode) && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {isEditing ? (
                          <>
                            <Edit3 className="w-4 h-4" />
                            <span>Update Expense</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            <span>Create Expense</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

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