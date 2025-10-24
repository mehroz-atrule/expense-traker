// components/Forms/ImageUploadField.tsx
import React, { useState, useEffect } from "react";
import { Upload, FileText, ZoomIn } from "lucide-react";

interface ImageUploadFieldProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  currentPreview: string | null;
  title: string;
  color: string;
  isEnabled: boolean;
  isEditMode?: boolean;
  existingImageText?: string;
  onImageClick: (imageUrl: string | null, title: string) => void;
  onFileChange: (file: File | null, type: string) => void;
  onEditClick?: (type: string) => void;
  onRemoveImage?: () => void;
  accept?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  type,
  label,
  icon,
  currentPreview,
  title,
  color,
  isEnabled,
  isEditMode = false,
  existingImageText,
  onImageClick,
  onFileChange,
  onEditClick,
  onRemoveImage,
  accept = "image/*,.pdf,application/pdf"
}) => {
  const [isPdf, setIsPdf] = useState(false);

  // Check if the preview is a PDF
  useEffect(() => {
    const checkPdf = async (url: string | null) => {
      if (!url) {
        setIsPdf(false);
        return;
      }

      try {
        if (url.startsWith("blob:")) {
          const response = await fetch(url);
          const contentType = response.headers.get("content-type");
          setIsPdf(contentType?.includes("pdf") || contentType?.includes("application/pdf") || false);
        } else {
          setIsPdf(url.toLowerCase().endsWith(".pdf"));
        }
      } catch (error) {
        console.error("Error checking PDF:", error);
        setIsPdf(false);
      }
    };

    checkPdf(currentPreview);
  }, [currentPreview]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPreview) {
      onImageClick(currentPreview, title);
    } else if (isEnabled) {
      const input = document.getElementById(`${type}Upload`) as HTMLInputElement | null;
      input?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file, type);
    // Reset input to allow uploading same file again
    e.target.value = '';
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveImage?.();
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon} {label}
        {existingImageText && (
          <span className="text-xs text-green-600">{existingImageText}</span>
        )}
      </label>

      <div
        role="button"
        tabIndex={0}
        onClick={handleContainerClick}
        onKeyDown={(e) => e.key === "Enter" && handleContainerClick(e as any)}
        className={`relative w-full h-32 sm:h-40 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden transition-all
          ${currentPreview
            ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400"
            : isEnabled
              ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50"
              : "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"}`}
      >
        {currentPreview ? (
          isPdf ? (
            // PDF Preview
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
                  {isEditMode && (
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
            // Image Preview
            <div className="relative w-full h-full group">
              <img
                src={currentPreview}
                alt={title}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 rounded-xl">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                    <ZoomIn className="w-6 h-6 text-gray-700" />
                  </div>
                  {isEditMode && (
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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isEnabled ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <Upload className={`w-6 h-6 ${isEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            <span className={`${isEnabled ? 'text-gray-700' : 'text-gray-400'} text-sm font-medium`}>
              {isEnabled ? `Upload ${label.split(' ')[0]}` : 'Upload Disabled'}
            </span>
            <span className={`${isEnabled ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>
              PNG, JPG, PDF
            </span>
          </div>
        )}
      </div>

      <input
        id={`${type}Upload`}
        type="file"
        accept={accept}
        className="hidden"
        disabled={!isEnabled}
        onChange={handleFileInputChange}
      />

      {/* Remove image button */}
      {currentPreview && onRemoveImage && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove Image
        </button>
      )}
    </div>
  );
};

export default ImageUploadField;