import React from "react";
import { Upload, FileText, CreditCard, ZoomIn, File } from "lucide-react";

interface ImageUploadSectionProps {
  preview: string | null;
  chequePreview: string | null;
  paymentSlipPreview: string | null;
  isViewMode: boolean;
  isEditing: boolean;
  isCashPayment: boolean;
  currentStatusKey: string;
  shouldShowPaymentSlip: boolean;
  onImageClick: (imageUrl: string | null, title: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "cheque" | "paymentSlip") => void;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  preview,
  chequePreview,
  paymentSlipPreview,
  isViewMode,
  isEditing,
  isCashPayment,
  currentStatusKey,
  shouldShowPaymentSlip,
  onImageClick,
  onFileChange,
}) => {
  
  // Function to check if file is PDF
  const isPdfFile = (fileUrl: string | null): boolean => {
    if (!fileUrl) return false;
    return fileUrl.toLowerCase().endsWith('.pdf') || 
           fileUrl.includes('/pdf/') || 
           fileUrl.includes('.pdf?') ||
           fileUrl.toLowerCase().includes('application/pdf');
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

    const isPdf = isPdfFile(currentPreview);

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (currentPreview) {
        onImageClick(currentPreview, title);
      } else if (isFieldEnabled) {
        const fileInput = document.getElementById(`${type}Upload`);
        if (fileInput) {
          (fileInput as HTMLInputElement).click();
        }
      }
    };

    return (
      <div className="space-y-2 sm:space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </label>
        
        <div
          onClick={handleClick}
          className={`
            relative w-full h-32 sm:h-40 border-2 border-dashed rounded-xl sm:rounded-lg 
            flex items-center justify-center transition-all duration-200 overflow-hidden
            ${currentPreview 
              ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50" 
              : isFieldEnabled
              ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 active:scale-95"
              : "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
            }
          `}
        >
          {currentPreview ? (
            <div className="relative w-full h-full">
              {isPdf ? (
                // PDF Preview - Show PDF icon and file info
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-4 rounded-xl sm:rounded-lg">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <File className="w-8 h-8 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">
                    PDF Document
                  </span>
                  <span className="text-xs text-gray-600 mt-1 text-center">
                    Click to view PDF
                  </span>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <File className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                // Image Preview
                <>
                  <img
                    src={currentPreview}
                    alt={title}
                    className="w-full h-full object-cover rounded-xl sm:rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-xl sm:rounded-lg flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                      <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                  <div className={`absolute top-2 right-2 w-6 h-6 ${color} rounded-full flex items-center justify-center`}>
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                </>
              )}
            </div>
          ) : (
            // Upload placeholder
            <div className="flex flex-col items-center p-4 text-center">
              <div className={`
                w-12 h-12 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-2
                ${isFieldEnabled ? 'bg-blue-50' : 'bg-gray-100'}
              `}>
                <Upload className={`
                  w-6 h-6 sm:w-4 sm:h-4
                  ${isFieldEnabled ? 'text-blue-500' : 'text-gray-400'}
                `} />
              </div>
              <span className={`
                text-sm font-medium
                ${isFieldEnabled ? 'text-gray-700' : 'text-gray-400'}
              `}>
                {isFieldEnabled ? `Upload ${label.split(' ')[0]}` : 'Upload Disabled'}
              </span>
              <span className={`
                text-xs mt-1
                ${isFieldEnabled ? 'text-gray-500' : 'text-gray-400'}
              `}>
                PNG, JPG, PDF
              </span>
            </div>
          )}
        </div>

        <input
          id={`${type}Upload`}
          type="file"
          accept="image/*,application/pdf"
          className="absolute opacity-0 -z-10"
          disabled={!isFieldEnabled}
          onChange={(e) => onFileChange(e, type)}
        />
      </div>
    );
  };

  // ✅ Cheque Image Logic:
  const showChequeImage = !isCashPayment && (
    currentStatusKey === "InReviewByFinance" ||
    currentStatusKey === "ReadyForPayment" || 
    currentStatusKey === "Paid"
  );
  
  const enableChequeImage = !isCashPayment && currentStatusKey === "InReviewByFinance";

  // ✅ Payment Slip Logic:
  const showPaymentSlipImage = shouldShowPaymentSlip;
  const enablePaymentSlipImage = currentStatusKey === "ReadyForPayment" || currentStatusKey === "Approved" && isCashPayment;

  return (
    <div className="bg-white rounded-2xl sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:border-l-4 sm:border-green-500 sm:pl-4">
          <div className="w-8 h-8 bg-green-100 rounded-full sm:hidden flex items-center justify-center">
            <Upload className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Documents & Receipts</h3>
            <p className="text-sm sm:text-xs text-gray-600">Upload bills, receipts, and supporting documents (Images & PDF)</p>
          </div>
        </div>
      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Expense Receipt - Only in create/edit mode */}
          {renderUploadField(
            "image",
            "Expense Receipt",
            <FileText className="w-4 h-4 text-blue-500 sm:hidden" />,
            preview,
            "Expense Receipt",
            "bg-green-500",
            true
          )}

          {/* Issued Cheque - Enabled based on status, even in view mode */}
          {showChequeImage && renderUploadField(
            "cheque",
            "Issued Cheque",
            <CreditCard className="w-4 h-4 text-orange-500 sm:hidden" />,
            chequePreview,
            "Issued Cheque",
            "bg-orange-500",
            enableChequeImage
          )}

          {/* Payment Slip - Enabled based on status, even in view mode */}
          {showPaymentSlipImage && renderUploadField(
            "paymentSlip",
            "Payment Receipt / Slip",
            <FileText className="w-4 h-4 text-purple-500 sm:hidden" />,
            paymentSlipPreview,
            "Payment Receipt",
            "bg-purple-500",
            enablePaymentSlipImage
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadSection;