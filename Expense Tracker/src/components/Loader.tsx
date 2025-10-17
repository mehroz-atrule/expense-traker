import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
  variant?: "spinner" | "dots" | "pulse" | "ring";
  color?: "blue" | "green" | "red" | "purple" | "gray" | "white";
  centered?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = "md", 
  text = "Processing...", 
  className = "",
  variant = "spinner",
  color = "blue",
  centered = false
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
    gray: "text-gray-600",
    white: "text-white"
  };

  const spinnerClasses = {
    blue: "border-blue-200 border-t-blue-600",
    green: "border-green-200 border-t-green-600",
    red: "border-red-200 border-t-red-600",
    purple: "border-purple-200 border-t-purple-600",
    gray: "border-gray-200 border-t-gray-600",
    white: "border-white/30 border-t-white"
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
            <div className={`w-1.5 h-1.5 bg-current rounded-full animate-bounce ${colorClasses[color]}`}></div>
            <div className={`w-1.5 h-1.5 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{animationDelay: '0.1s'}}></div>
            <div className={`w-1.5 h-1.5 bg-current rounded-full animate-bounce ${colorClasses[color]}`} style={{animationDelay: '0.2s'}}></div>
          </div>
        );
      
      case "pulse":
        return (
          <div className={`rounded-full bg-current animate-pulse ${sizeClasses[size]} ${colorClasses[color]}`}></div>
        );

      case "ring":
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <div className={`absolute inset-0 rounded-full border-2 border-current opacity-20 ${colorClasses[color]}`}></div>
            <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin ${colorClasses[color]}`}></div>
          </div>
        );
      
      default: // spinner
        return (
          <div 
            className={`animate-spin rounded-full border-2 ${spinnerClasses[color]} ${sizeClasses[size]}`}
          ></div>
        );
    }
  };

  const containerClasses = `flex items-center justify-center gap-3 ${centered ? 'w-full' : ''} ${className}`;

  return (
    <div className={containerClasses}>
      {renderLoader()}
      {text && (
        <span className={`font-medium ${textSizes[size]} ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;