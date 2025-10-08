"use client";

import React, { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeft, Upload } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ExpenseStatusTracker from "../../components/Status Tracker/StatusTracker";
import Input from "../../components/Forms/Input";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import type { Expense } from "../../redux/submitter/submitterSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createExpense, UpdateExpense, removeExpense } from "../../redux/submitter/submitterSlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import { listOffices } from "../../api/adminApi";

interface Option {
  value: string;
  label: string;
}

interface FormData {
  title: string;
  date: string;
  amount: string;
  category: string;
  office: string;
  vendor: string;
  payment: string;
  description: string;
  image?: File | null; // ✅ use image field instead of receipt
}

const CreateExpenseView: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    date: "",
    amount: "",
    category: "",
    office: "",
    vendor: "",
    payment: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => (s as any)?.auth?.user?.role || "submitter");

  const state = (location.state as { expense?: Expense } | null) || null;
  const viewExpense = state?.expense;
  const isViewMode = !!viewExpense;
  const canEdit = role === "admin" || role === "submitter";

  const categoryOptions: Option[] = [
    { value: "Travel", label: "Travel" },
    { value: "Food", label: "Food" },
    { value: "Office Supplies", label: "Office Supplies" },
  ];

  const paymentOptions: Option[] = [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Credit Card", label: "Credit Card" },
  ];

  useEffect(() => {
    listOffices()
      .then((list: any[]) => {
        const opts = (list || []).map((o: any) => ({
          value: o._id || o.name,
          label: o.name,
        }));
        console.log("Fetched offices:", opts);
        setOfficeOptions(opts);
      })
      .catch(() => setOfficeOptions([]));
  }, []);

  // ✅ populate form if viewing
  useEffect(() => {
    if (viewExpense) {
      setFormData({
        title: viewExpense.title || "",
        date:
          viewExpense.expenseDate?.split("T")[0] ||
          (viewExpense.createdAt
            ? new Date(viewExpense.createdAt).toISOString().slice(0, 10)
            : ""),
        amount: viewExpense.amount ? String(viewExpense.amount) : "",
        category: viewExpense.category || "",
        office: viewExpense.officeId || "",
        vendor: viewExpense.vendor || "",
        payment: viewExpense.paymentMethod || "",
        description: viewExpense.description || "",
        image: null, // file upload is not preloaded
      });
      setPreview(viewExpense.receiptUrl || null); // ✅ use imageUrl if available
    }
  }, [viewExpense]);

  // ✅ Handle file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPreview(file ? URL.createObjectURL(file) : null);
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // ✅ Generic field change handler
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    console.log(`Field ${field} changed to`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Submit handler (with file upload support)
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: any = {
      _id: viewExpense?._id,
      title: formData.title,
      vendor: formData.vendor,
      amount: Number(formData.amount || 0),
      category: formData.category,
      office: formData.office,
      payment: formData.payment,
      description: formData.description,
      date: formData.date ? new Date(formData.date).toISOString() : undefined,
    };
console.log("Submitting expense with payload:", payload);
    // If there's an image, build FormData
    let dataToSend: any = payload;
    if (formData.image) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          form.append(key, value as any);
      });
      form.append("image", formData.image); // 👈 append image file
      dataToSend = form;
    }

    if (viewExpense?._id) {
      dispatch(UpdateExpense({ id: viewExpense._id, payload: dataToSend })).then(() =>
        navigate(-1)
      );
    } else {
      dispatch(createExpense(dataToSend)).then(() => navigate(-1));
    }
  };

  // ✅ Delete logic
  const onDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    if (viewExpense?._id) {
      dispatch(removeExpense(viewExpense._id));
    }
    setConfirmOpen(false);
    navigate(-1);
  };
  const cancelDelete = () => setConfirmOpen(false);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600"
        >
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      {isViewMode && (
        <ExpenseStatusTracker
          currentStatus={viewExpense?.status || "New"}
          reason={viewExpense?.title}
        />
      )}

      {/* ✅ Image Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Image</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div
            onClick={() => {
              if (!isViewMode || canEdit)
                document.getElementById("imageUpload")?.click();
            }}
            className={`w-48 h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg ${
              isViewMode
                ? "cursor-default opacity-90"
                : "cursor-pointer text-gray-400 hover:text-blue-600 hover:border-blue-400"
            } transition-all duration-200 relative overflow-hidden group`}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Image Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <Upload size={18} />
                    Change Image
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-3">
                <Upload size={28} strokeWidth={1.5} className="mb-2" />
                <p className="text-sm font-medium text-gray-500">Upload Image</p>
                <p className="text-xs text-gray-400">(Click to browse file)</p>
              </div>
            )}
          </div>

          <input
            id="imageUpload"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isViewMode && !canEdit}
          />
        </div>
      </div>

      {/* Expense Info */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-6"
      >
        <h2 className="text-lg font-semibold text-gray-700">Expense Information</h2>

        <div className="flex flex-col gap-6">
          <Input
            label="Expense Title"
            value={formData.title}
            onChange={(val) => handleChange("title", val)}
            placeholder="Enter expense title"
            disabled={isViewMode && !canEdit}
            readOnly={isViewMode && !canEdit}
          />

          <div className="flex w-full gap-5">
            <Input
              label="Expense Date"
              type="date"
              value={formData.date}
              onChange={(val) => handleChange("date", val)}
              disabled={isViewMode && !canEdit}
              readOnly={isViewMode && !canEdit}
            />
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(val) => handleChange("amount", val)}
              placeholder="Enter amount"
              disabled={isViewMode && !canEdit}
              readOnly={isViewMode && !canEdit}
            />
          </div>

          <div className="flex w-full gap-5">
            <SelectDropdown
              label="Category"
              options={categoryOptions}
              value={
                formData.category
                  ? categoryOptions.find((opt) => opt.value === formData.category) || null
                  : null
              }
              onChange={(opt) => handleChange("category", opt?.value || "")}
              isDisabled={isViewMode && !canEdit}
            />
            <SelectDropdown
              label="Office"
              options={officeOptions}
              value={
                formData.office
                  ? officeOptions.find((opt) => opt.value === formData.office) || null
                  : null
              }
              onChange={(opt) => handleChange("office", opt?.value || "")}
              isDisabled={isViewMode && !canEdit}
            />
          </div>

          <div className="flex w-full gap-5">
            <Input
              label="Vendor"
              value={formData.vendor}
              onChange={(val) => handleChange("vendor", val)}
              placeholder="Enter vendor name"
              disabled={isViewMode && !canEdit}
              readOnly={isViewMode && !canEdit}
            />
            <SelectDropdown
              label="Payment Method"
              options={paymentOptions}
              value={
                formData.payment
                  ? paymentOptions.find((opt) => opt.value === formData.payment) || null
                  : null
              }
              onChange={(opt) => handleChange("payment", opt?.value || "")}
              isDisabled={isViewMode && !canEdit}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("description", e.target.value)
              }
              placeholder="Enter description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isViewMode && !canEdit}
            />
          </div>
        </div>

        <div className="flex justify-between">
          {isViewMode && canEdit ? (
            <button
              type="button"
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              Delete
            </button>
          ) : (
            <span />
          )}

          <div>
            {isViewMode ? (
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                  >
                    Update
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Back
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                Save Expense
              </button>
            )}
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default CreateExpenseView;
