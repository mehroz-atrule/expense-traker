import React from "react";
import { FileText } from "lucide-react";
import EnhancedInput from "../../components/Forms/EnhancedInput";

interface BasicInfoSectionProps {
  title: string;
  description: string;
  isViewMode: boolean;
  isEditing: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  title,
  description,
  isViewMode,
  isEditing,
  onTitleChange,
  onDescriptionChange,
}) => {
  return (
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
        <EnhancedInput
          label="Expense Title"
          value={title}
          onChange={onTitleChange}
          placeholder="Enter expense title"
          disabled={isViewMode && !isEditing}
          readOnly={isViewMode && !isEditing}
        />
        
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onDescriptionChange(e.target.value)
            }
            placeholder="Enter description"
            rows={4}
            className="w-full border border-gray-300 rounded-xl sm:rounded-lg p-3 sm:p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
            disabled={isViewMode && !isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;