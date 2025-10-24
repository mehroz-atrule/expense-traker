// Updated CreatePettycashExpense.tsx
import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import EnhancedInput from "../../components/Forms/EnhancedInput";
import { FileText, ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  createPettyCashExpense,
  getPettyCashExpense,
  updatePettyCashExpenseById
} from "../../redux/pettycash/pettycashSlice";
import { listOffices } from "../../api/adminApi";
import type { Office, Option } from "../../types";
import Loader from "../../components/Loader";
import MonthYearPicker from "../../components/MonthYearPicker";
import type { PettyCashFormData } from "../../types/pettycash";
import ImageUploadField from "../../components/Forms/ImageUpload";

const CreatePettycashExpense: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const isEditMode = Boolean(id);

  const getCurrentMonthYear = () => {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${year}`;
  };

  const getCurrentDate = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState<PettyCashFormData>({
    office: "",
    title: "",
    description: "",
    dateOfPayment: getCurrentDate(),
    amount: "",
    month: getCurrentMonthYear(),
    chequeImage: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingImage, setExistingImage] = useState<string | null>(null);

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

  // Fetch offices
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

  // Fetch existing expense data if in edit mode
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await dispatch(getPettyCashExpense(id) as any).unwrap();
        const expenseData = response?.pettycash || response?.txn;

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
          month: expenseData.month || getCurrentMonthYear(),
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
      fetchExpenseData();
    }
  }, [id, isEditMode, dispatch, navigate]);

  const handleChange = (k: string, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleMonthChange = (monthValue: string) => {
    setForm((prev) => ({ ...prev, month: monthValue }));
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setForm((prev) => ({ ...prev, chequeImage: file }));
      setPreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setExistingImage(null);
    setForm(prev => ({ ...prev, chequeImage: null }));
  };

  const handleImageClick = (imageUrl: string | null) => {
    if (imageUrl) {
      // Open image in new tab or show in modal
      window.open(imageUrl, '_blank');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
        await dispatch(updatePettyCashExpenseById({
          id: id,
          payload: formData
        }) as any);
      } else {
        await dispatch(createPettyCashExpense(formData) as any);
      }

      navigate(`/dashboard/expenses?tab=pettycash&page=1&office=${form.office}&month=10-2025`);

    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} petty cash expense`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} expense`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? 'Edit Pettycash Expense' : 'Create Pettycash Expense'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEditMode ? 'Update existing expense' : 'Add a new petty cash expense'}
                  </p>
                </div>
              </div>
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
              isDisabled={id ? true : false}
            />
          )}

          {/* Month Field */}
          <MonthYearPicker
            label="Month"
            selectedValue={form.month}
            onValueChange={handleMonthChange}
            showLabel={true}
          />

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

          {/* Cheque Image Upload using reusable component */}
          <ImageUploadField
            type="cheque"
            label="Cheque / Receipt Image"
            icon={<FileText className="w-4 h-4 text-blue-500" />}
            currentPreview={preview || existingImage}
            title="Cheque / Receipt"
            color="bg-blue-500"
            isEnabled={true}
            isEditMode={isEditMode}
            existingImageText={existingImage ? "(Existing image will be kept unless changed)" : undefined}
            onImageClick={handleImageClick}
            onFileChange={handleFileChange}
            onRemoveImage={handleRemoveImage}
          />

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