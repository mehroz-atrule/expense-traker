"use client";

import React, { use, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft, Upload, FileText, CreditCard, Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ExpenseStatusTracker from "../../components/Status Tracker/StatusTracker";
import type { Office, Option } from "../../types";
import type { Expense } from "../../types/expense";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createExpense, UpdateExpense, removeExpense, getExpense, clearExpenseDetails } from "../../redux/submitter/submitterSlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import { listOffices } from "../../api/adminApi";
import type { RootState } from "../../app/store";
import { fetchVendorDropdown, fetchVendors } from "../../redux/vendor/vendorSlice";

// Import components
import ChequeDetailsSection from "../../components/ExpenseForm/ChequeDetailsSection";
import BasicInfoSection from "../../components/ExpenseForm/BasicInfoSection";
import DateInfoSection from "../../components/ExpenseForm/DateInfoSection";
import FinancialDetailsSection from "../../components/ExpenseForm/FinancialDetailsSection";
import CategoryDetailsSection from "../../components/ExpenseForm/CategoryDetailsSection";
import ImageUploadSection from "../../components/ExpenseForm/ImageUploadSection";
import ImageModal from "../../components/ImageViewModal";
import Loader from "../../components/Loader";

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
  WHT?: number;
  advanceTax?: number;
  amountAfterTax?: number;
  chequeImage?: File | null;
  paymentSlip?: File | null;
  chequeNumber: string;
  bankName: string;
  status?: string;
}

// Constants
const STATUS_FLOW = [
  'WaitingForApproval',
  'Approved',
  'ReviewedByFinance',
  'ReadyForPayment',
  'Paid',
] as const;

const CATEGORY_OPTIONS: Option[] = [
  { value: "Internet Bill", label: "Internet Bill" },
  { value: "Cloud Computing", label: "Cloud Computing" },
  { value: "Dues and Subscriptions", label: "Dues and Subscriptions" },
  { value: "Financial Services / Consultancy", label: "Financial Services / Consultancy" },
  { value: "Electricity Bill", label: "Electricity Bill" },
  { value: "Telephone Bill", label: "Telephone Bill" },
  { value: "Office Rent", label: "Office Rent" },
  { value: "Solar Plates Bill", label: "Solar Plates Bill" },
  { value: "Office Maintenance", label: "Office Maintenance" },
  { value: "FBR", label: "FBR" },
  { value: "Pettycash", label: "Pettycash" },
  { value: "Computer Hardware", label: "Computer Hardware" },
  { value: "Salaries", label: "Salaries" },
  { value: "Salaries WHT", label: "Salaries WHT" },
  { value: "EOBI Employer’s Share", label: "EOBI Employer’s Share" },
  { value: "Others", label: "Others" },
  { value: "Misc.", label: "Misc." },
];

const PAYMENT_OPTIONS: Option[] = [
  { value: "Cash", label: "Cash" },
  { value: "BankTransfer", label: "Bank Transfer" },
  { value: "Cheque", label: "Cheque" },
];

const CreateExpenseView: React.FC = () => {
  // State Management
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    amountAfterTax: 0,
    chequeNumber: "",
    bankName: "",
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [chequePreview, setChequePreview] = useState<string | null>(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [vendorOptions, setVendorOptions] = useState<Option[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageTitle, setCurrentImageTitle] = useState("");

  // Hooks
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const id = queryParams.get("id");
  const mode = queryParams.get("mode");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => (s as any)?.auth?.user?.role || "submitter");
  const vendors = useAppSelector((s: RootState) => s.vendor.dropdownVendors || []);
  const { loading: submitterLoading, expenses } = useAppSelector((s: RootState) => s.submitter);
  //   const viewExpense = useAppSelector((s: RootState) =>
  //   s.submitter.expenses.find(e => e._id === id)
  // );
  const { loading, expenseDetails: viewExpense } = useAppSelector(
    (state: RootState) => state.submitter
  );
  console.log({ viewExpense });

  console.log({ id, mode });

  useEffect(() => {
    if (id) {
      dispatch(getExpense(id));
    }
    return () => {
      dispatch(clearExpenseDetails());
    };
  }, [id, dispatch]);



  // Derived State
  const state = (location.state as { expense?: Expense } | null) || null;

  // const viewExpense = state?.expense;
  const isViewMode = !!viewExpense;
  const canEdit = role === "admin" || role === "submitter";

  const normalizeStatus = (s?: string) => (s || '').replace(/\s+/g, '').replace(/[^A-Za-z]/g, '');
  const currentStatusKey = normalizeStatus(viewExpense?.status);
  const isRejected = (viewExpense?.status || '').toLowerCase() === 'rejected' ||
    (viewExpense?.status || '').startsWith('Rejected');
  const isPaid = currentStatusKey === 'Paid';
  const currentIndex = STATUS_FLOW.findIndex(k => k === currentStatusKey);
  const nextStatusKey = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ?
    STATUS_FLOW[currentIndex + 1] : undefined;

  const isCashPayment = formData.payment === "Cash";

  // Status Logic
  const getNextStatus = () => {
    if (isCashPayment) return "Paid";

    if (formData.payment === "BankTransfer") {
      if (currentStatusKey === "WaitingForApproval") return "Approved";
      if (currentStatusKey === "Approved") return "Paid";
    }

    return nextStatusKey;
  };

  const effectiveNextStatus = getNextStatus();

  // Conditional Display Logic
  const shouldShowChequeDetails =
    (isViewMode && !isEditing && formData.payment === "Cheque" && (
      currentStatusKey === "ReviewedByFinance" ||
      currentStatusKey === "ReadyForPayment" ||
      currentStatusKey === "Paid"
    )) ||
    ((!isViewMode || isEditing) && formData.payment === "Cheque" &&
      (formData.chequeImage || chequePreview));

  const shouldEnableChequeFields =
    !isViewMode || isEditing ||
    (isViewMode && !isEditing && !isCashPayment && currentStatusKey === "ReviewedByFinance");

  const shouldShowPaymentSlip =
    (formData.payment === "BankTransfer" && currentStatusKey === "Approved") ||
    (formData.payment === "Cash" && currentStatusKey === "WaitingForApproval") ||
    (!isCashPayment && currentStatusKey === "Paid") ||
    (!isCashPayment && currentStatusKey === "ReadyForPayment");

  // Effects
  useEffect(() => {
    const initializeData = async () => {
      try {
        const offices = await listOffices();
        const officeOpts = (offices || []).map((o: Office) => ({
          value: o._id || o.name,
          label: o.name,
        }));
        setOfficeOptions(officeOpts);
      } catch (error) {
        setOfficeOptions([]);
      }
    };

    initializeData();
    dispatch(fetchVendorDropdown() as any);
  }, [dispatch]);

  useEffect(() => {
    const vendorOpts = vendors.map(v => ({ value: v._id, label: v.vendorName }));
    setVendorOptions(vendorOpts);
  }, [vendors]);

  useEffect(() => {

    if (viewExpense) {
      const expenseData = {
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
        chequeNumber: (viewExpense as any).chequeNumber || "",
        bankName: (viewExpense as any).bankName || "",
        WHT: (viewExpense as any).WHT ? Number((viewExpense as any).WHT) : 0,
        advanceTax: (viewExpense as any).advanceTax || 0,
        amountAfterTax: (viewExpense as any).amountAfterTax ?
          Number((viewExpense as any).amountAfterTax) : 0,
      };

      setFormData(expenseData);
      setPreview(viewExpense.image || null);
      setChequePreview((viewExpense as any).chequeImage || null);
      setPaymentSlipPreview((viewExpense as any).paymentSlip || null);
    }
  }, [viewExpense]);

  // Event Handlers
  const handleImageClick = (imageUrl: string | null, title: string) => {
    if (!imageUrl) return;
    setCurrentImage(imageUrl);
    setCurrentImageTitle(title);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentImage(null);
    setCurrentImageTitle("");
  };

  const handleEditClick = (type: "image" | "cheque" | "paymentSlip") => {
    // Trigger file input click for the specified type
    const input = document.getElementById(`${type}Upload`) as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "image" | "cheque" | "paymentSlip"
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const url = URL.createObjectURL(file);
    console.log("Generated URL:", url);

    setFormData(prev => ({
      ...prev,
      [type === "image" ? "image" :
        type === "cheque" ? "chequeImage" : "paymentSlip"]: file
    }));

    // Update previews and cleanup previous URLs
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

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => {
      const updated: any = { ...prev, [field]: value };

      // Auto-calculate vendor WHT
      if (field === "vendor") {
        const selectedVendor = vendors.find(v => v._id === value);
        if (selectedVendor) {
          updated.WHT = Number((selectedVendor as any).WHT ?? (selectedVendor as any).Tax) || 0;
        }
      }

      // Calculate amount after tax
      const amountNum = parseFloat(String(updated.amount || "0")) || 0;
      const whtNum = parseFloat(String(updated.WHT || "0")) || 0;
      const advanceTaxNum = parseFloat(String(updated.advanceTax || "0")) || 0;

      const total = amountNum -  whtNum;
      updated.amountAfterTax = Number(total.toFixed(2));

      return updated;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitExpense();
  };

  const handleApprove = () => {
    submitExpense(true);
  };

  const submitExpense = async (isApprove = false) => {
    const payload: Expense & { chequeNumber?: string; bankName?: string; status?: string } = {
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
      chequeNumber: formData.chequeNumber,
      bankName: formData.bankName,
      image: viewExpense?.image || undefined,
      chequeImage: viewExpense?.chequeImage || undefined,
      paymentSlip: viewExpense?.paymentSlip || undefined,
      status: viewExpense?.status || "WaitingForApproval"
    };

    if (isApprove && effectiveNextStatus) {
      payload.status = isCashPayment ? "Paid" : effectiveNextStatus;
    }

    let dataToSend: any = payload;
    if (formData.image || formData.chequeImage || formData.paymentSlip) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, value as any);
        }
      });
      if (formData.image) form.append("image", formData.image);
      if (formData.chequeImage) form.append("chequeImage", formData.chequeImage);
      if (formData.paymentSlip) form.append("paymentSlip", formData.paymentSlip);
      dataToSend = form;
    }

    try {
      setIsSubmitting(true); // Add loading state
      if (viewExpense?._id) {
        const result = await dispatch(UpdateExpense({ id: viewExpense._id, payload: dataToSend })).unwrap();
        if (result) {
          console.log("Expense updated successfully:", result);
          navigate(-1);
        }
      } else {
        const result = await dispatch(createExpense(dataToSend)).unwrap();
        if (result) {
          console.log("Expense created successfully:", result);
          navigate(-1);
        }
      }
    } catch (error) {
      console.error("Failed to submit expense:", error);
      // Show error to user
      alert("Failed to save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      if (viewExpense) {
        // Reset form data to original expense data
        const resetData = {
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
          chequeNumber: (viewExpense as any).chequeNumber || "",
          bankName: (viewExpense as any).bankName || "",
          WHT: (viewExpense as any).WHT ? Number((viewExpense as any).WHT) : 0,
          advanceTax: (viewExpense as any).advanceTax || 0,
          amountAfterTax: (viewExpense as any).amountAfterTax ?
            Number((viewExpense as any).amountAfterTax) : 0,
        };
        setFormData(resetData);
      }
    } else {
      navigate(-1);
    }
  };

  const onDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    if (viewExpense?._id) {
      dispatch(removeExpense(viewExpense._id));
    }
    setConfirmOpen(false);
    navigate(-1);
  };
  const cancelDelete = () => setConfirmOpen(false);

  // Helper Components
  const ActionButtons = () => {
    const getApproveButtonText = () => {
      if (isCashPayment) return "Mark as Paid";

      if (formData.payment === "BankTransfer") {
        if (currentStatusKey === "WaitingForApproval") return "Approve";
        if (currentStatusKey === "Approved") return "Mark as Paid";
      }

      switch (effectiveNextStatus) {
        case "Approved": return "Approve";
        case "ReviewedByFinance": return "Send to Finance Review";
        case "ReadyForPayment": return "Ready for Payment";
        case "Paid": return "Mark as Paid";
        default: return "Approve";
      }
    };

    return (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-end">
        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitterLoading || isSubmitting}
          className="order-2 sm:order-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {isEditing ? "Cancel Changes" : "Cancel"}
        </button>

        <div className="order-1 sm:order-2 flex flex-col sm:flex-row gap-3">
          {/* Approve/Reject buttons */}
          {isViewMode && !isEditing && !isRejected && !isPaid && effectiveNextStatus && (
            <>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitterLoading || isSubmitting}
                className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {submitterLoading ? (
                  <Loader size="sm" text="" className="!text-white" />
                ) : (
                  <>✓ {getApproveButtonText()}</>
                )}
              </button>
              {
                effectiveNextStatus !== "Paid" &&
                < button
                  type="button"
                  onClick={() =>
                    dispatch(
                      UpdateExpense({
                        id: viewExpense._id as string,
                        payload: { status: 'Rejected' },
                      })
                    )
                  }
                  disabled={submitterLoading}
                  className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  ✗ Reject
                </button>}

            </>
          )}

          {/* Edit Button */}
          {isViewMode && !isEditing && !isPaid && !isRejected && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={submitterLoading}
              className="px-4 py-3 sm:py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Expense
            </button>
          )}

          {/* Submit/Update Button */}
          {(isEditing || !isViewMode) && (
            <button
              type="submit"
              disabled={submitterLoading}
              className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {submitterLoading ? (
                <Loader size="sm" text="Processing..." className="!text-white" />
              ) : (
                <>
                  {isEditing ? <Edit3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  <span>{isEditing ? "Update Expense" : "Create Expense"}</span>
                </>
              )}
            </button>
          )}

          {/* Status Indicators */}
          {isViewMode && !isEditing && isPaid && (
            <div className="px-4 py-3 sm:py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Expense Paid (Read Only)
            </div>
          )}

          {isViewMode && !isEditing && isRejected && (
            <div className="px-4 py-3 sm:py-2 text-sm font-medium text-red-500 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Expense Rejected (Read Only)
            </div>
          )}
        </div>
      </div >
    );
  };
  const Header = () => (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {isViewMode
                      ? (isEditing ? "Edit Expense" : "Expense Details")
                      : "Create New Expense"
                    }
                  </h1>
                  {isEditing && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Editing Mode
                    </span>
                  )}
                  {isPaid && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Paid
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ✗ Rejected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {isViewMode ? `ID: ${viewExpense?._id?.slice(-6) || 'N/A'}` : "Fill in the details below"}
                </p>
              </div>
            </div>
          </div>

          {isViewMode && !isEditing && currentStatusKey !== "Paid" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(v => !v)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Edit Expense</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onDelete(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Status Tracker */}
      {isViewMode && viewExpense && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ExpenseStatusTracker
              currentStatus={viewExpense?.status || "New"}
              reason={viewExpense?.title}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
          {/* Document Upload Section */}
          <ImageUploadSection
            preview={preview}
            chequePreview={chequePreview}
            paymentSlipPreview={paymentSlipPreview}
            isViewMode={isViewMode}
            isEditing={isEditing}
            isCashPayment={isCashPayment}
            currentStatusKey={currentStatusKey}
            shouldShowPaymentSlip={shouldShowPaymentSlip}
            onFileChange={handleFileChange}
            onImageClick={handleImageClick}
            onEditClick={handleEditClick}
            isBankTransfer={formData.payment === "BankTransfer"}
          />

          {/* Cheque Details Section */}
          {shouldShowChequeDetails && (
            <ChequeDetailsSection
              chequeNumber={formData.chequeNumber}
              bankName={formData.bankName}
              isViewMode={isViewMode}
              isEditing={shouldEnableChequeFields}
              onChequeNumberChange={(value) => handleChange("chequeNumber", value)}
              onBankNameChange={(value) => handleChange("bankName", value)}
            />
          )}

          {/* Expense Info Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8"
          >
            {/* Basic Information */}
            <BasicInfoSection
              title={formData.title}
              description={formData.description}
              isViewMode={isViewMode}
              isEditing={isEditing}
              onTitleChange={(value) => handleChange("title", value)}
              onDescriptionChange={(value) => handleChange("description", value)}
            />

            {/* Date Information */}
            <DateInfoSection
              billDate={formData.billDate}
              dueDate={formData.dueDate}
              paymentDate={formData.paymentDate || ""}
              isViewMode={isViewMode}
              isEditing={isEditing}
              onBillDateChange={(value) => handleChange("billDate", value)}
              onDueDateChange={(value) => handleChange("dueDate", value)}
              onPaymentDateChange={(value) => handleChange("paymentDate", value)}
              currentStatusKey={currentStatusKey}
              paymentMethod={formData.payment}
            />

            {/* Financial Details */}
            <FinancialDetailsSection
              amount={formData.amount}
              WHT={formData.WHT || 0}
              advanceTax={formData.advanceTax || 0}
              amountAfterTax={formData.amountAfterTax || 0}
              isViewMode={isViewMode}
              isEditing={isEditing}
              showTaxFields={
                currentStatusKey === "Approved" ||
                currentStatusKey === "ReviewedByFinance" ||
                currentStatusKey === "ReadyForPayment" ||
                currentStatusKey === "Paid"
              }
              enableTaxEditing={currentStatusKey === "Approved"}
              onAmountChange={(value) => handleChange("amount", value)}
              onWHTChange={(value) => handleChange("WHT", value)}
              onAdvanceTaxChange={(value) => handleChange("advanceTax", value)}
              onAmountAfterTaxChange={(value) => handleChange("amountAfterTax", value)}
            />

            {/* Category & Details */}
            <CategoryDetailsSection
              category={formData.category}
              office={formData.office}
              vendor={formData.vendor}
              payment={formData.payment}
              vendorOptions={vendorOptions}
              officeOptions={officeOptions}
              categoryOptions={CATEGORY_OPTIONS}
              paymentOptions={PAYMENT_OPTIONS}
              isViewMode={isViewMode}
              isEditing={isEditing}
              onCategoryChange={(value) => handleChange("category", value)}
              onOfficeChange={(value) => handleChange("office", value)}
              onVendorChange={(value) => handleChange("vendor", value)}
              onPaymentChange={(value) => handleChange("payment", value)}
            />

            {/* Action Buttons */}
            <div className="pt-6 border-t">
              <ActionButtons />
            </div>
          </form>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        imageUrl={currentImage || ""}
        title={currentImageTitle}
      />

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