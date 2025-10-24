// Updated ImageUploadSection.tsx
import React from "react";
import { FileText, CreditCard } from "lucide-react";
import ImageUploadField from "../Forms/ImageUpload";

interface ImageUploadSectionProps {
  preview: string | null;
  chequePreview: string | null;
  paymentSlipPreview: string | null;
  isViewMode: boolean;
  isEditing: boolean;
  isCashPayment: boolean;
  isBankTransfer: boolean;
  currentStatusKey: string;
  shouldShowPaymentSlip: boolean;
  onImageClick: (imageUrl: string | null, title: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "cheque" | "paymentSlip") => void;
  showExpenseReceipt?: boolean;
  onEditClick?: (type: "image" | "cheque" | "paymentSlip") => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  preview,
  chequePreview,
  paymentSlipPreview,
  isViewMode,
  isEditing,
  isCashPayment,
  isBankTransfer,
  currentStatusKey,
  shouldShowPaymentSlip,
  onImageClick,
  onFileChange,
  showExpenseReceipt = true,
  onEditClick,
}) => {

  const handleFileChange = (file: File | null, type: string) => {
    // Create a synthetic event for compatibility
    const syntheticEvent = {
      target: {
        files: file ? [file] : []
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    onFileChange(syntheticEvent, type as "image" | "cheque" | "paymentSlip");
  };

  const renderUploadField = (
    type: "image" | "cheque" | "paymentSlip",
    label: string,
    icon: React.ReactNode,
    currentPreview: string | null,
    title: string,
    color: string,
    isEnabled: boolean
  ) => {
    const isFieldEnabled = type === "image"
      ? (!isViewMode || isEditing)
      : isEnabled;

    return (
      <ImageUploadField
        type={type}
        label={label}
        icon={icon}
        currentPreview={currentPreview}
        title={title}
        color={color}
        isEnabled={isFieldEnabled}
        isEditMode={isEditing}
        onImageClick={onImageClick}
        onFileChange={(file) => handleFileChange(file, type)}
        onEditClick={
          onEditClick
            ? (t: string) => onEditClick(t as "image" | "cheque" | "paymentSlip")
            : undefined
        }
      />
    );
  };

  const showChequeImage = !isCashPayment && (
    currentStatusKey === "ReviewedByFinance" ||
    currentStatusKey === "ReadyForPayment" ||
    currentStatusKey === "Paid"
  );

  const enableChequeImage = !isCashPayment && currentStatusKey === "ReviewedByFinance";
  const showPaymentSlipImage = shouldShowPaymentSlip;
  const enablePaymentSlipImage =
    currentStatusKey === "ReadyForPayment" ||
    (currentStatusKey === "Approved" && (isCashPayment || isBankTransfer)) ||
    (currentStatusKey === "WaitingForApproval" && isCashPayment);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-l-4 border-green-500 pl-4">
          <h3 className="text-base font-semibold text-gray-900">Documents & Receipts</h3>
          <p className="text-sm text-gray-600">Upload bills, receipts, and supporting documents</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {showExpenseReceipt && renderUploadField("image", "Expense Receipt", <FileText className="w-4 h-4 text-blue-500" />, preview, "Expense Receipt", "bg-green-500", true)}
          {showChequeImage && renderUploadField("cheque", "Issued Cheque", <CreditCard className="w-4 h-4 text-orange-500" />, chequePreview, "Issued Cheque", "bg-orange-500", enableChequeImage)}
          {showPaymentSlipImage && renderUploadField("paymentSlip", "Payment Receipt / Slip", <FileText className="w-4 h-4 text-purple-500" />, paymentSlipPreview, "Payment Receipt", "bg-purple-500", enablePaymentSlipImage)}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadSection;