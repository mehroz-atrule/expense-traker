import React from "react";
import { ZoomIn, ZoomOut, RotateCw, Download, X, File, ExternalLink } from "lucide-react";

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

  // Function to check if file is PDF
  const isPdfFile = (url: string): boolean => {
    return url.toLowerCase().endsWith('.pdf') || 
           url.includes('/pdf/') || 
           url.includes('.pdf?') ||
           url.includes('application/pdf');
  };

  const isPdf = isPdfFile(imageUrl);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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
    const link = document.createElement('a');
    link.href = imageUrl;
    const extension = isPdf ? 'pdf' : 'jpg';
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageClick = () => {
    if (!isPdf) {
      setScale(prev => prev === 1 ? 1.5 : 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className={`relative ${isPdf ? 'w-full h-full max-w-6xl' : 'max-w-4xl max-h-full'} w-full h-auto`}>
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
            {/* Controls - Hide zoom/rotate for PDF */}
            {!isPdf && (
              <>
                <button
                  onClick={() => setScale(prev => Math.min(prev + 0.25, 3))}
                  className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setScale(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={resetTransform}
                  className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Reset"
                >
                  <span className="text-sm font-bold">⟲</span>
                </button>
              </>
            )}
            
            {/* Common controls */}
            <button
              onClick={handleDownload}
              className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {isPdf && (
              <button
                onClick={handleOpenInNewTab}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className={`flex items-center justify-center h-full ${isPdf ? 'pt-16 pb-4' : 'pt-16 pb-4'}`}>
          {isPdf ? (
            // PDF Viewer - Use iframe for PDF display
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              <iframe
                src={imageUrl}
                className="w-full h-full border-0"
                title="PDF Document"
              />
            </div>
          ) : (
            // Image Viewer
            <div className="relative">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-[80vh] object-contain transition-transform duration-200 cursor-zoom-in"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
                onClick={handleImageClick}
              />
              
              {/* Scale Indicator */}
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