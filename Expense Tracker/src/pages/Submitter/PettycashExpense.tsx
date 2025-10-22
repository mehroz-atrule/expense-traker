import React, { use, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deletePettyCashExpenseById, fetchPettyCash } from '../../redux/pettycash/pettycashSlice';
import { fetchOffices } from '../../redux/admin/adminSlice';
import type { Office } from '../../types/admin';

// Components

import ImageModal from '../../components/ImageViewModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

// Types
import type { PettyCashRecord } from '../../types/pettycash';
import type { AppDispatch, RootState } from '../../app/store';
import PettyCashHeader from '../../components/Pettycash/pettycashHeader';
import PettyCashSearch from '../../components/Pettycash/pettycashSearch';
import OfficeTabs from '../../components/Pettycash/officeTabs';
import ExpenseSheetTable from '../../components/Pettycash/expenseSheetTable';
import CreateEditModal from '../../components/Pettycash/createEditModal';
import ViewModal from '../../components/Pettycash/viewModal';
import { useNavigate } from 'react-router-dom';

// Helper function to get current month
const getCurrentMonth = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${month.toString().padStart(2, '0')}-${year}`;
};
const PettycashExpense: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { pettyCashRecords, total, page, limit, loading, summary } = useSelector(
    (state: RootState) => state.pettycash
  );

  console.log("summary data:", summary);
  const { offices, loading: officesLoading } = useSelector(
    (state: RootState) => state.admin
  );

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [localPage, setLocalPage] = useState(1);
  const [localLimit] = useState(10);
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PettyCashRecord | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Extract data
  const pettyList = Array.isArray(pettyCashRecords) ? pettyCashRecords : [];
  const totalRecords = total || 0;
  const currentPage = page || 1;
  const totalPages = Math.ceil(totalRecords / (limit || 10));

  // Get summary data
  const openingBalance = summary?.openingBalance || 0;
  const closingBalance = summary?.closingBalance || 0;
  const totalExpense = summary?.totalExpense || 0;
  const TotalIncome = summary?.totalIncome || 0;

  // Set default office when offices load
  useEffect(() => {
    if (offices.length > 0 && !selectedOffice) {
      setSelectedOffice(offices[0]._id!);
    }
  }, [offices, selectedOffice]);

  // Fetch data when filters change
  useEffect(() => {
    // Fetch offices if not loaded
    if (offices.length === 0) {
      dispatch(fetchOffices());
    }

    // Fetch pettycash with office ID and current month
    const params: Record<string, any> = {
      query: searchTerm,
      page: localPage,
      limit: localLimit,
      month: getCurrentMonth() // Add current month to params
    };

    if (selectedOffice) {
      params.office = selectedOffice;
    }

    dispatch(fetchPettyCash(params));
  }, [dispatch, searchTerm, localPage, localLimit, selectedOffice, offices.length]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setLocalPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setLocalPage(newPage);
  };

  const handleOfficeChange = (officeId: string) => {
    setSelectedOffice(officeId);
    setLocalPage(1);
  };

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedItem(null);
    setCreateModalOpen(true);
  };
  const navigate = useNavigate();

  // PettycashExpense.tsx mein handleEdit function update karen
  const handleEdit = (record: PettyCashRecord) => {
    setSelectedItem(record);

    // ✅ Type check karo
    if (record.transactionType === 'expense') {
      // Expense type hai toh CreatePettycashExpense page pe redirect karo
      navigate(`/admin/pettycash/create-expense?id=${record._id}`);
    } else {
      // Income type hai toh existing modal use karo
      setEditMode(true);
      setCreateModalOpen(true);
    }
  };

  const handleView = (record: PettyCashRecord) => {
    setSelectedItem(record);
    setViewModalOpen(true);
  };

  const handleDelete = (record: PettyCashRecord) => {
    setPendingDeleteId(record._id!);
    setSelectedItem(record);
    setConfirmDeleteOpen(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeModals = () => {
    setCreateModalOpen(false);
    setViewModalOpen(false);
    setEditMode(false);
    setSelectedItem(null);
    setConfirmDeleteOpen(false);
    setPendingDeleteId(null);
  };

  // Get current office name
  const getCurrentOfficeName = () => {
    if (!selectedOffice) return '';
    const office = offices.find(o => o._id === selectedOffice);
    return office?.name || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PettyCashHeader onCreateNew={handleCreateNew} />

      {/* Search Bar */}
      <PettyCashSearch
        searchTerm={searchTerm}
        onSearch={handleSearch}
        totalRecords={totalRecords}
        loading={loading}
      />

      {/* Office Tabs */}
      <OfficeTabs
        offices={offices}
        selectedOffice={selectedOffice}
        onOfficeChange={handleOfficeChange}
        loading={officesLoading}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-6">
        <ExpenseSheetTable
          records={pettyList}
          loading={loading}
          officeName={getCurrentOfficeName()}
          openingBalance={openingBalance}
          closingBalance={closingBalance}
          totalExpense={totalExpense}
          totalIncome={TotalIncome}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onImageClick={handleImageClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEditModal
        open={createModalOpen}
        editMode={editMode}
        selectedItem={selectedItem}
        offices={offices}
        selectedOffice={selectedOffice}
        onClose={closeModals}
      />

      <ViewModal
        open={viewModalOpen}
        selectedItem={selectedItem}
        onClose={closeModals}
        onImageClick={handleImageClick}
      />

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={currentImage || ''}
        title="Cheque Image"
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Pettycash Record"
        message="Are you sure you want to delete this pettycash record? This action cannot be undone."
        onConfirm={async () => {
          if (!pendingDeleteId) return;

          try {
            // 🔥 Delete the record
            await dispatch(deletePettyCashExpenseById(pendingDeleteId)).unwrap();

            // ✅ Optionally re-fetch list (to refresh balances/summary)
            dispatch(fetchPettyCash({
              query: searchTerm,
              page: localPage,
              limit: localLimit,
              month: getCurrentMonth(),
              office: selectedOffice,
            }));

            // ✅ Close modal & reset
            setConfirmDeleteOpen(false);
            setPendingDeleteId(null);
            setSelectedItem(null);
          } catch (error) {
            console.error('Failed to delete petty cash expense:', error);
          }
        }}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setPendingDeleteId(null);
        }}
        loading={loading}
      />

    </div>
  );
};

export default PettycashExpense;