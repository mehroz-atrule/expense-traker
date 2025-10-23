import React from "react";
import { Upload, FileText, CreditCard, ZoomIn,  } from "lucide-react";

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

  const [pdfStates, setPdfStates] = React.useState<{ [key: string]: boolean }>({});

  // Move the PDF checking logic to component-level useEffect
  React.useEffect(() => {
    const checkPdf = async (url: string | null, type: string) => {
      if (!url) {
        setPdfStates(prev => ({ ...prev, [type]: false }));
        return;
      }

      try {
        if (url.startsWith("blob:")) {
          const response = await fetch(url);
          const contentType = response.headers.get("content-type");
          setPdfStates(prev => ({
            ...prev,
            [type]: contentType?.includes("pdf") || contentType?.includes("application/pdf") || false
          }));
        } else {
          setPdfStates(prev => ({
            ...prev,
            [type]: url.toLowerCase().endsWith(".pdf")
          }));
        }
      } catch (error) {
        console.error("Error checking PDF:", error);
        setPdfStates(prev => ({ ...prev, [type]: false }));
      }
    };

    // Check PDF status for all previews
    checkPdf(preview, "image");
    checkPdf(chequePreview, "cheque");
    checkPdf(paymentSlipPreview, "paymentSlip");
  }, [preview, chequePreview, paymentSlipPreview]);

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


    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (currentPreview) {
        onImageClick(currentPreview, title);
      } else if (isFieldEnabled) {
        const input = document.getElementById(`${type}Upload`) as HTMLInputElement | null;
        input?.click();
      }
    };

    return (
      <div className="space-y-2 sm:space-y-3">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon} {label}
        </label>

        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => e.key === "Enter" && handleClick(e as any)}
          className={`relative w-full h-32 sm:h-40 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden transition-all
            ${currentPreview
              ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400"
              : isFieldEnabled
                ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                : "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"}`}
        >
          {currentPreview ? (
            pdfStates[type] ? (
              // PDF Preview with better styling
              <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 group">
                <div className="flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-red-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 block truncate max-w-full">
                    PDF Document
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Click to view
                  </span>
                </div>
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all duration-200 rounded-xl">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                    <div className="bg-white bg-opacity-80 rounded-full p-2">
                      <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                    {(isEditing || !currentStatusKey) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick?.(type);
                        }}
                        className="bg-white bg-opacity-80 rounded-full p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // ✅ Image Preview
              <div className="relative w-full h-full group">
                <img
                  src={currentPreview}
                  alt={title}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 rounded-xl">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                    <div className="bg-white bg-opacity-90 rounded-full p-2">
                      <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                    {(isEditing || !currentStatusKey) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick?.(type);
                        }}
                        className="bg-white bg-opacity-80 rounded-full p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className={`absolute top-2 right-2 w-6 h-6 ${color} rounded-full flex items-center justify-center`}>
                  <FileText className="w-3 h-3 text-white" />
                </div>
              </div>
            )
          ) : (
            // Empty State
            <div className="flex flex-col items-center p-4 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isFieldEnabled ? 'bg-blue-50' : 'bg-gray-100'}`}>
                <Upload className={`w-6 h-6 ${isFieldEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <span className={`${isFieldEnabled ? 'text-gray-700' : 'text-gray-400'} text-sm font-medium`}>
                {isFieldEnabled ? `Upload ${label.split(' ')[0]}` : 'Upload Disabled'}
              </span>
              <span className={`${isFieldEnabled ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>
                PNG, JPG, PDF
              </span>
            </div>
          )}
        </div>

        <input
          id={`${type}Upload`}
          type="file"
          accept="image/*,.pdf,application/pdf"
          className="hidden"
          disabled={!isFieldEnabled}
          onChange={(e) => onFileChange(e, type)}
        />
      </div>
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