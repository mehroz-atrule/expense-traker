import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Forms/Input";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import EnhancedInput from "../../components/Forms/EnhancedInput";
import { Upload, ZoomIn, FileText } from "lucide-react";
import { useDispatch } from "react-redux";
import type { PettyCashRecord } from "../../types/pettycash";
import { createPettyCashExpense } from "../../redux/pettycash/pettycashSlice";
import { listOffices } from "../../api/adminApi"; // 👈 same API used in CreateExpenseView
import type { Office, Option } from "../../types";
import Loader from "../../components/Loader";

const CreatePettycashExpense: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    office: "",
    title: "",
    description: "",
    dateOfPayment: "",
    amountSpent: "",
    chequeImage: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

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
        // ✅ Default select first office
        if (opts.length > 0 && !form.office) {
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

  const handleChange = (k: string, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, chequeImage: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("office", form.office);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("dateOfPayment", form.dateOfPayment);
    formData.append("amountSpent", form.amountSpent);

    if (form.chequeImage) {
      formData.append("chequeImage", form.chequeImage);
    }
try {
  await dispatch(createPettyCashExpense(formData) as any);
  navigate(-1);
  
} catch (error) {
  console.error("Failed to create petty cash expense", error);
}finally {
  setLoading(false);
  };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">
                Create Pettycash Expense
              </h1>
              <p className="text-sm text-gray-500">
                Add a new petty cash expense
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
          {loading ? (
            <Loader size="sm" text="Loading offices..." />
          ) : (
            <SelectDropdown
              label="Office"
              options={officeOptions}
              value={officeOptions.find((o) => o.value === form.office) || null}
              onChange={(opt: any) => handleChange("office", opt?.value)}
            />
          )}

          {/* Title */}
          <EnhancedInput
            label="Title"
            value={form.title}
            onChange={(v) => handleChange("title", v)}
            placeholder="Expense title"
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
            />
            <EnhancedInput
              label="Amount"
              type="number"
              value={form.amountSpent}
              onChange={(v) => handleChange("amountSpent", v)}
            />
          </div>

          {/* Cheque Image Upload */}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Cheque / Receipt Image
            </label>

            <div
              onClick={() => document.getElementById("chequeUpload")?.click()}
              className={`relative w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center transition-all duration-200 overflow-hidden ${
                preview
                  ? "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                  : "border-gray-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50 active:scale-95"
              }`}
            >
              {preview ? (
                <div className="relative w-full h-full">
                  <img
                    src={preview}
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
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded border bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >{loading ?
            
              <Loader size="sm" text="Saving "  />: 'Save Expense' 
            }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePettycashExpense;
