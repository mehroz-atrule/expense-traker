import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Input from "../../components/Forms/Input";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import EnhancedInput from "../../components/Forms/EnhancedInput";
import { Upload, ZoomIn, FileText } from "lucide-react";
import { useDispatch } from "react-redux";
import type { PettyCashRecord } from "../../types/pettycash";
import {
  createPettyCashExpense,
  getPettyCashExpense,
  updatePettyCashExpenseById
} from "../../redux/pettycash/pettycashSlice";
import { listOffices } from "../../api/adminApi";
import type { Office, Option } from "../../types";
import Loader from "../../components/Loader";

const CreatePettycashExpense: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  console.log("Received ID:", id);

  const isEditMode = Boolean(id);
  console.log("Is Edit Mode:", isEditMode);

  // Function to get current month in "October-2025" format
  const getCurrentMonthYear = () => {
    const date = new Date();
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const monthNumber = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return {
      display: `${monthName}-${year}`,
      value: `${monthNumber}-${year}`,
    };
  };

  const [form, setForm] = useState({
    office: "",
    title: "",
    description: "",
    dateOfPayment: "",
    amount: "",
    displayMonth: getCurrentMonthYear().display,
    month: getCurrentMonthYear().value,
    chequeImage: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  // ✅ MISSING FUNCTION ADD KAREN YAHAN
  // Helper function to convert ISO date to yyyy-mm-dd format
  const formatDateForInput = (isoDateString: string): string => {
    if (!isoDateString) return '';

    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Helper function to convert "MM-YYYY" to "Month-YYYY" display format
  const getMonthDisplay = (monthString: string): string => {
    if (!monthString) return getCurrentMonthYear().display;

    try {
      const [month, year] = monthString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleString("en-US", { month: "long", year: "numeric" });
    } catch {
      return getCurrentMonthYear().display;
    }
  };

  // 🧩 Fetch offices from API
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        setLoading(true);
        const offices = await listOffices();
        const opts = (offices || []).map((o: Office) => ({
          value: o._id || o.name,
          label: o.name,
        }));
        setOfficeOptions(opts);

        if (opts.length > 0 && !form.office && !isEditMode) {
          setForm((prev) => ({ ...prev, office: opts[0].value }));
        }
      } catch (err) {
        console.error("Failed to load offices", err);
        setOfficeOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);

  // 🧩 Fetch existing expense data if in edit mode
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!id) return;

      try {
        setLoading(true);
     const response = await dispatch(getPettyCashExpense(id) as any).unwrap();
const expenseData = response?.pettycash || response?.txn;

console.log("Full API response:", response);
console.log("Expense data:", expenseData);

if (!expenseData) throw new Error("No petty cash expense data found");

const officeId = typeof expenseData.office === "string"
  ? expenseData.office
  : expenseData.office?._id || "";

setForm({
  office: officeId,
  title: expenseData.title || "",
  description: expenseData.description || "",
  dateOfPayment: formatDateForInput(expenseData.dateOfPayment),
  amount: expenseData.amount?.toString() || "",
  displayMonth: getMonthDisplay(expenseData.month),
  month: expenseData.month || getCurrentMonthYear().value,
  chequeImage: null,
});

if (expenseData.chequeImage) {
  setExistingImage(expenseData.chequeImage);
  setPreview(expenseData.chequeImage);
}


      } catch (error) {
        console.error("Failed to fetch expense data", error);
        alert("Failed to load expense data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode && id) {
      console.log("Fetching expense data for ID:", id);
      fetchExpenseData();
    }
  }, [id, isEditMode, dispatch, navigate]);

  // Helper function to convert "MM-YYYY" to "Month-YYYY" display format


  const handleChange = (k: string, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, chequeImage: file }));
      setPreview(URL.createObjectURL(file));
      setExistingImage(null); // ✅ Existing image clear karo if new file upload kiya
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // ✅ Validation
    if (!form.office || !form.title || !form.amount || !form.dateOfPayment) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("office", form.office);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("dateOfPayment", form.dateOfPayment);
      formData.append("amount", form.amount);
      formData.append("month", form.month);

      formData.append("transactionType", "expense");

      if (form.chequeImage) {
        formData.append("chequeImage", form.chequeImage);
      }

      if (isEditMode && id) {
        // ✅ Update existing expense
        await dispatch(updatePettyCashExpenseById({
          id: id,
          payload: formData
        }) as any);
      } else {
        // ✅ Create new expense
        await dispatch(createPettyCashExpense(formData) as any);
      }

      navigate(-1); // ✅ Previous page pe wapas jao

    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} petty cash expense`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} expense`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Edit/Create ke hisab se change karo */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900 max-sm:text-sm">
                {isEditMode ? 'Edit Pettycash Expense' : 'Create Pettycash Expense'}
              </h1>
              <p className="text-sm text-gray-500 max-sm:hidden">
                {isEditMode ? 'Update existing expense' : 'Add a new petty cash expense'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
        >
          {/* Office */}
          {loading && officeOptions.length === 0 ? (
            <Loader size="sm" text="Loading offices..." />
          ) : (
            <SelectDropdown
              label="Office"
              options={officeOptions}
              value={officeOptions.find((o) => o.value === form.office) || null}
              onChange={(opt: any) => handleChange("office", opt?.value)}
            />
          )}

          {/* Month Field - Non-editable */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Month
            </label>
            <input
              type="text"
              value={form.displayMonth}
              readOnly
              className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              This field shows the current month and cannot be edited
            </p>
          </div>

          {/* Title */}
          <EnhancedInput
            label="Title"
            value={form.title}
            onChange={(v) => handleChange("title", v)}
            placeholder="Expense title"
            required
          />

          {/* Description */}
          <textarea
            placeholder="Enter description"
            rows={4}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          {/* Date + Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedInput
              label="Payment Date"
              type="date"
              value={form.dateOfPayment}
              onChange={(v) => handleChange("dateOfPayment", v)}
              required
            />
            <EnhancedInput
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(v) => handleChange("amount", v)}
              required
            />
          </div>

          {/* Cheque Image Upload */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Cheque / Receipt Image
              {existingImage && (
                <span className="text-xs text-green-600">(Existing image will be kept unless changed)</span>
              )}
            </label>

            <div
              onClick={() => document.getElementById("chequeUpload")?.click()}
              className={`relative w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-200 overflow-hidden ${preview || existingImage
                ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                : "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 active:scale-95"
                }`}
            >
              {preview || existingImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={preview || existingImage || ''}
                    alt="Cheque Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                      <ZoomIn className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Upload Image
                  </span>
                  <span className="text-xs mt-1 text-gray-500">
                    PNG, JPG, PDF
                  </span>
                </div>
              )}
            </div>

            <input
              id="chequeUpload"
              type="file"
              accept="image/*,application/pdf"
              className="absolute opacity-0 -z-10"
              onChange={handleFileChange}
            />

            {/* ✅ Remove image button */}
            {(preview || existingImage) && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setExistingImage(null);
                  setForm(prev => ({ ...prev, chequeImage: null }));
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove Image
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded border bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <Loader size="sm" text={isEditMode ? "Updating..." : "Saving..."} />
              ) : (
                isEditMode ? 'Update Expense' : 'Save Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePettycashExpense;