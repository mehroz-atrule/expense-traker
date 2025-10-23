import React from "react";
import { ZoomIn, ZoomOut, RotateCw, Download, X, File } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title = "Document Preview"
}) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [isPdf, setIsPdf] = React.useState(false);


  React.useEffect(() => {
    const checkFileType = async () => {
      try {
        if (imageUrl.startsWith('blob:')) {
          const response = await fetch(imageUrl);
          const contentType = response.headers.get('content-type');
          setIsPdf(contentType?.includes('pdf') || contentType?.includes('application/pdf') || false);
        } else {
          setIsPdf(
            imageUrl.toLowerCase().endsWith('.pdf') || 
            imageUrl.toLowerCase().includes('/pdf') ||
            imageUrl.toLowerCase().includes('application/pdf')
          );
        }
      } catch (error) {
        console.error('Error checking file type:', error);
        setIsPdf(false);
      }
    };

    checkFileType();
  }, [imageUrl]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      setScale(1);
      setRotation(0);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    const extension = isPdf ? "pdf" : "jpg";
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleImageClick = () => {
    if (!isPdf) setScale(prev => (prev === 1 ? 1.5 : 1));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className={`relative ${isPdf ? "w-full h-full max-w-6xl" : "max-w-4xl max-h-full"} w-full h-auto`}>
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-white text-lg font-semibold">{title}</h3>
            {isPdf && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                <File className="w-3 h-3" />
                PDF
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isPdf && (
              <>
                <button onClick={() => setScale(prev => Math.min(prev + 0.25, 3))} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                  <RotateCw className="w-5 h-5" />
                </button>
                <button onClick={resetTransform} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
                  <span className="text-sm font-bold">⟲</span>
                </button>
              </>
            )}
            <button onClick={handleDownload} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center h-full pt-16 pb-4">
          {isPdf ? (
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              <iframe src={imageUrl} className="w-full h-full border-0" title="PDF Document" />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain transition-transform duration-200 cursor-zoom-in"
                style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
                onClick={handleImageClick}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(scale * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
