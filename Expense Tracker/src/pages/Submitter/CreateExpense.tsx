"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft, Upload, FileText, CreditCard, Edit3, MoreVertical, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ExpenseStatusTracker from "../../components/Status Tracker/StatusTracker";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import type { Office, Option } from "../../types";
import type { Expense } from "../../types/expense";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createExpense, UpdateExpense, removeExpense } from "../../redux/submitter/submitterSlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import { listOffices } from "../../api/adminApi";
import type { RootState } from "../../app/store";
import { fetchVendors } from "../../redux/vendor/vendorSlice";

// Import ALL components
import ChequeDetailsSection from "../../components/ExpenseForm/ChequeDetailsSection";
import BasicInfoSection from "../../components/ExpenseForm/BasicInfoSection";
import DateInfoSection from "../../components/ExpenseForm/DateInfoSection";
import FinancialDetailsSection from "../../components/ExpenseForm/FinancialDetailsSection";
import CategoryDetailsSection from "../../components/ExpenseForm/CategoryDetailsSection";
import ImageUploadSection from "../../components/ExpenseForm/ImageUploadSection";
import ImageModal from "../../components/ImageViewModal";

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
    amountAfterTax: 0,
    chequeNumber: "",
    bankName: "",
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
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageTitle, setCurrentImageTitle] = useState("");

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

  // Check if payment method is cash
  const isCashPayment = formData.payment === "Cash";

  // Determine next status based on payment method
  const getNextStatus = () => {
    if (isCashPayment) {
      if (nextStatusKey === "InReviewByFinance" || nextStatusKey === "ReadyForPayment") {
        return "Paid";
      }
    }
    return nextStatusKey;
  };

  const effectiveNextStatus = getNextStatus();

 // Update shouldShowChequeDetails logic in main component
const shouldShowChequeDetails = 
  (isViewMode && !isEditing && !isCashPayment && (
    currentStatusKey === "InReviewByFinance" ||
    currentStatusKey === "ReadyForPayment" ||
    currentStatusKey === "Paid"
  )) ||
  ((!isViewMode || isEditing) && !isCashPayment && (formData.payment === "Cheque" || !!formData.chequeImage || !!chequePreview));

const shouldEnableChequeFields =
  !isViewMode ||
  isEditing ||
  (isViewMode && !isEditing && !isCashPayment && currentStatusKey === "InReviewByFinance");

  const shouldShowPaymentSlip = 
    (isViewMode && !isEditing && isCashPayment && currentStatusKey === "Approved" && effectiveNextStatus === "Paid") ||
    (isViewMode && !isEditing && !isCashPayment && currentStatusKey === "ReadyForPayment" && effectiveNextStatus === "Paid") ||
    currentStatusKey === "Paid";

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

  // Image handlers
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

  useEffect(() => {
    listOffices()
      .then((list: Office[]) => {
        const opts = (list || []).map((o: Office) => ({
          value: o._id || o.name,
          label: o.name,
        }));
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
        chequeNumber: (viewExpense as any).chequeNumber || "",
        bankName: (viewExpense as any).bankName || "",
        WHT: (viewExpense as any).WHT ? Number((viewExpense as any).WHT) : 0,
        advanceTax: (viewExpense as any).advanceTax || 0,
        amountAfterTax: (viewExpense as any).amountAfterTax ? Number((viewExpense as any).amountAfterTax) : 0,
      });
      setPreview(viewExpense.image || null);
      setChequePreview((viewExpense as any).chequeImage || null);
      setPaymentSlipPreview((viewExpense as any).paymentSlip || null);
    }
    console.log("📝 View Expense:", viewExpense);
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

      if (field === "vendor") {
        const selectedVendor = vendors.find(v => v._id === value);
        if (selectedVendor) updated.WHT = Number((selectedVendor as any).WHT ?? (selectedVendor as any).Tax) || 0;
      }

      const amountNum = parseFloat(String(updated.amount || "0")) || 0;
      const advanceTaxNum = parseFloat(String(updated.advanceTax || "0")) || 0;
      const taxNum = parseFloat(String(updated.WHT || "0")) || 0;

      const base = amountNum - advanceTaxNum;
      const total = base + (base * (taxNum / 100));
      updated.amountAfterTax = Number(total.toFixed(2));

      return updated;
    });
  };

  // Submit handler for form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitExpense();
  };

  // Submit handler for approve button
// Submit handler for approve button
const handleApprove = () => {
  submitExpense(true);
};

// Main submit function
const submitExpense = (isApprove = false) => {
  setLoading(true);

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
    
    // ✅ YEH ADD KARO - Cheque details always include karo
    chequeNumber: formData.chequeNumber,
    bankName: formData.bankName,
    
    image: viewExpense?.image || undefined,
    chequeImage: viewExpense?.chequeImage || undefined,
    paymentSlip: viewExpense?.paymentSlip || undefined,
  };

  // If approving, add status
  if (isApprove && effectiveNextStatus) {
    payload.status = effectiveNextStatus;
    
    // ✅ Agar non-cash payment hai aur InReviewByFinance status par ja rahe hain
    // toh cheque details ko specially include karo
    if (!isCashPayment && effectiveNextStatus === "InReviewByFinance") {
      console.log("📝 Including cheque details for finance review:", {
        chequeNumber: formData.chequeNumber,
        bankName: formData.bankName
      });
    }
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

  // ✅ Debugging ke liye console log
  console.log("🚀 Submitting payload:", payload);
  console.log("💰 Cheque details in payload:", {
    chequeNumber: payload.chequeNumber,
    bankName: payload.bankName,
    isApprove: isApprove,
    effectiveNextStatus: effectiveNextStatus
  });

  if (viewExpense?._id) {
    dispatch(UpdateExpense({ id: viewExpense._id, payload: dataToSend }));
  } else {
    dispatch(createExpense(dataToSend));
  }
  navigate(-1);
  setLoading(false);
};

  // Cancel logic
  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
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
          chequeNumber: (viewExpense as any).chequeNumber || "",
          bankName: (viewExpense as any).bankName || "",
          WHT: (viewExpense as any).WHT ? Number((viewExpense as any).WHT) : 0,
          advanceTax: (viewExpense as any).advanceTax || 0,
          amountAfterTax: (viewExpense as any).amountAfterTax ? Number((viewExpense as any).amountAfterTax) : 0,
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

  // Action buttons component - Responsive
  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-end">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={handleCancel}
        className="order-2 sm:order-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 flex items-center justify-center gap-2"
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
              disabled={loading}
              className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              ✓ {isCashPayment ? "Mark as Paid" : "Approve"}
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
              className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 flex items-center justify-center gap-2"
            >
              ✗ Reject
            </button>
          </>
        )}

        {/* Edit Button */}
        {isViewMode && !isEditing && !isPaid && !isRejected && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-3 sm:py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Expense
          </button>
        )}

        {/* Submit/Update Button */}
        {(isEditing || !isViewMode) && (
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

            {isViewMode && !isEditing && (
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
          {/* Document Upload Section - Use Component */}
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
            />

            {/* Financial Details */}
            <FinancialDetailsSection
              amount={formData.amount}
              WHT={formData.WHT || 0}
              advanceTax={formData.advanceTax || 0}
              amountAfterTax={formData.amountAfterTax || 0}
              isViewMode={isViewMode}
              isEditing={isEditing}
              onAmountChange={(value) => handleChange("amount", value)}
              onWHTChange={(value) => handleChange("WHT", value)}
              onAdvanceTaxChange={(value) => handleChange("advanceTax", value)}
            />

            {/* Category & Details */}
            <CategoryDetailsSection
              category={formData.category}
              office={formData.office}
              vendor={formData.vendor}
              payment={formData.payment}
              vendorOptions={vendorOptions}
              officeOptions={officeOptions}
              categoryOptions={categoryOptions}
              paymentOptions={paymentOptions}
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