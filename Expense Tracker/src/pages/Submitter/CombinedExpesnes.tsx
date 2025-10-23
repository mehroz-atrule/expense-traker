import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Components
import ImageModal from '../../components/ImageViewModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import CombinedHeader from '../../components/Expesnes/CombinedHeader';
import SearchBar from '../../components/Expesnes/SearchBar';
import DynamicFilters from '../../components/Expesnes/ExpenseFilter';
import VendorExpensesList from '../../components/Expesnes/VendorExpenseList';
import PettyCashExpensesList from '../../components/Expesnes/PettyCashExpenseList';
import ViewExpenseModal from '../../components/Expesnes/viewExpenseModal';
import OfficeTabs from '../../components/Pettycash/officeTabs';

// Redux
import { fetchExpenses, removeExpense } from '../../redux/submitter/submitterSlice';
import { deletePettyCashExpenseById, fetchPettyCash } from '../../redux/pettycash/pettycashSlice';
import { fetchOffices } from '../../redux/admin/adminSlice';

// Types
type ExpenseTab = 'vendor' | 'pettycash';

interface VendorFilters {
  office: string;
  vendor: string;
  status: string;
  category: string;
  dateFrom: string;
  dateTo: string;
}

interface PettyCashFilters {
  month: string;
  transactionType: string;
  dateFrom: string;
  dateTo: string;
}

// Helper function to get current month
const getCurrentMonth = (): string => {
  const date = new Date();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01, 02, ..., 12
  const year = date.getFullYear();
  return `${month}-${year}`; // MM-YYYY
};

const CombinedExpensesScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux states
  const { expenses = [], total: vendorTotal = 0, loading: vendorLoading } = useSelector((s: any) => s.submitter);
  const { pettyCashRecords = [], total: pettyCashTotal = 0, loading: pettyCashLoading, summary } = useSelector((s: any) => s.pettycash);
  const { offices, loading: officesLoading } = useSelector((s: any) => s.admin);

  // Main state
  const [activeTab, setActiveTab] = useState<ExpenseTab>('vendor');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Pagination
  const [vendorPage, setVendorPage] = useState(1);
  const [pettyCashPage, setPettyCashPage] = useState(1);
  const limit = 10;

  // Office selection for petty cash (like in PettycashExpense)
  const [selectedOffice, setSelectedOffice] = useState<string>('');

  // Filters
  const [vendorFilters, setVendorFilters] = useState<VendorFilters>({
    office: '',
    vendor: '',
    status: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [pettyCashFilters, setPettyCashFilters] = useState<PettyCashFilters>({
    month: getCurrentMonth(),
    transactionType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageTitle, setCurrentImageTitle] = useState('');

  // Get active tab from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') as ExpenseTab;
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Update URL when tab changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', activeTab);
    navigate(`?${searchParams.toString()}`, { replace: true });
  }, [activeTab, navigate, location.search]);

  // Set default office when offices load
  useEffect(() => {
    if (offices.length > 0 && !selectedOffice && activeTab === 'pettycash') {
      setSelectedOffice(offices[0]._id!);
    }
  }, [offices, selectedOffice, activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'vendor') {
      fetchVendorExpenses();
    } else {
      fetchPettyCashData();
    }
  }, [
    activeTab, 
    searchTerm, 
    vendorFilters, 
    vendorPage, 
    pettyCashFilters, 
    pettyCashPage,
    selectedOffice // Add selectedOffice dependency for petty cash
  ]);

  // Fetch offices
  useEffect(() => {
    if (offices.length === 0) {
      dispatch(fetchOffices());
    }
  }, [dispatch, offices.length]);

  const fetchVendorExpenses = () => {
    const params: any = {
      q: searchTerm || undefined,
      office: vendorFilters.office || undefined,
      vendor: vendorFilters.vendor || undefined,
      status: vendorFilters.status !== 'all' ? vendorFilters.status : undefined,
      category: vendorFilters.category !== 'all' ? vendorFilters.category : undefined,
      startDate: vendorFilters.dateFrom || undefined,
      endDate: vendorFilters.dateTo || undefined,
      page: vendorPage,
      limit,
    };
    dispatch(fetchExpenses(params));
  };

  const fetchPettyCashData = () => {
    const params: any = {
      q: searchTerm,
      page: pettyCashPage,
      limit,
      month: pettyCashFilters.month,
      office: selectedOffice || undefined, // Use selectedOffice instead of pettyCashFilters.office
    };
    dispatch(fetchPettyCash(params));
  };

  // Handlers
  const handleTabChange = (tab: ExpenseTab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setShowFilters(false);
    // Reset to first page when switching tabs
    setVendorPage(1);
    setPettyCashPage(1);
  };

  const handleCreateNew = () => {
    if (activeTab === 'vendor') {
      navigate('/vendor/create-expense');
    } else {
      navigate('/pettycash/create-expense');
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (activeTab === 'vendor') {
      setVendorPage(1);
    } else {
      setPettyCashPage(1);
    }
  };

  // Month change handler for petty cash
  const handleMonthChange = (month: string) => {
    setPettyCashFilters(prev => ({ ...prev, month }));
    setPettyCashPage(1);
  };

  const handleOfficeChange = (officeId: string) => {
    setSelectedOffice(officeId);
    setPettyCashPage(1);
  };

  const handleVendorPageChange = (newPage: number) => {
    setVendorPage(newPage);
  };

  const handlePettyCashPageChange = (newPage: number) => {
    setPettyCashPage(newPage);
  };

  const handleResetVendorFilters = () => {
    setVendorFilters({
      office: '',
      vendor: '',
      status: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleResetPettyCashFilters = () => {
    setPettyCashFilters({
      month: getCurrentMonth(),
      transactionType: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setPettyCashPage(1);
  };

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    if (activeTab === 'vendor') {
      navigate(`/vendor/create-expense?id=${expense._id}`, { state: { expense } });
    } else {
      if (expense.transactionType === 'expense') {
        navigate(`/pettycash/create-expense?id=${expense._id}`);
      }
    }
  };

  const handleDeleteExpense = (expense: any) => {
    setSelectedExpense(expense);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedExpense?._id) return;

    try {
      if (activeTab === 'vendor') {
        await dispatch(removeExpense(selectedExpense._id));
        fetchVendorExpenses();
      } else {
        await dispatch(deletePettyCashExpenseById(selectedExpense._id)).unwrap();
        fetchPettyCashData();
      }
      setConfirmDeleteOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleImageClick = (imageUrl: string | null, title: string) => {
    if (!imageUrl) return;
    setCurrentImage(imageUrl);
    setCurrentImageTitle(title);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setCurrentImage(null);
    setCurrentImageTitle('');
  };

  // Helper functions
const getOfficeName = (office) => {
    if (!office) return 'N/A';

    if (typeof office === 'string') {
        // office is an ID
        const found = offices.find((o) => o._id === office);
        return found?.name || office;
    }

    if (typeof office === 'object') {
        // office is already an object
        return office.name || 'N/A';
    }

    return 'N/A';
};


  // Calculate totals
  const vendorTotalPages = Math.ceil(vendorTotal / limit);
  const pettyCashTotalPages = Math.ceil(pettyCashTotal / limit);

  const tabs = [
    { id: 'vendor', label: 'Vendor Expenses', count: vendorTotal },
    { id: 'pettycash', label: 'Petty Cash', count: pettyCashTotal }
  ];

  // Get current office name for display
  const getCurrentOfficeName = () => {
    if (!selectedOffice) return '';
    const office = offices.find(o => o._id === selectedOffice);
    return office?.name || '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Combined Header */}
      <CombinedHeader
        activeTab={activeTab}
        tabs={tabs}
        viewMode={viewMode}
        onTabChange={handleTabChange}
        onViewModeChange={setViewMode}
        onCreateNew={handleCreateNew}
        onNavigateBack={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          
          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearch={handleSearch}
            activeTab={activeTab}
            selectedMonth={activeTab === 'pettycash' ? pettyCashFilters.month : undefined}
            onMonthChange={activeTab === 'pettycash' ? handleMonthChange : undefined}
          />

          {/* Office Tabs - Only for Petty Cash */}
          {activeTab === 'pettycash' && (
            <OfficeTabs
              offices={offices}
              selectedOffice={selectedOffice}
              onOfficeChange={handleOfficeChange}
              loading={officesLoading}
            />
          )}

          {/* Dynamic Filters - Only for Vendor */}
          {activeTab === 'vendor' && (
            <DynamicFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              activeTab={activeTab}
              vendorFilters={vendorFilters}
              pettyCashFilters={pettyCashFilters}
              onVendorFilterChange={setVendorFilters}
              onPettyCashFilterChange={setPettyCashFilters}
              onResetVendorFilters={handleResetVendorFilters}
              onResetPettyCashFilters={handleResetPettyCashFilters}
              offices={offices}
            />
          )}

          {/* Content Area */}
          {activeTab === 'vendor' ? (
            <VendorExpensesList
              expenses={expenses}
              loading={vendorLoading}
              viewMode={viewMode}
              onView={handleViewExpense}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onImageClick={handleImageClick}
              getOfficeName={getOfficeName}
              totalPages={vendorTotalPages}
              currentPage={vendorPage}
              onPageChange={handleVendorPageChange}
              searchTerm={searchTerm}
            />
          ) : (
            <PettyCashExpensesList
              records={pettyCashRecords}
              loading={pettyCashLoading}
              viewMode={viewMode}
              onView={handleViewExpense}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onImageClick={handleImageClick}
              getOfficeName={getOfficeName}
              totalPages={pettyCashTotalPages}
              currentPage={pettyCashPage}
              onPageChange={handlePettyCashPageChange}
              searchTerm={searchTerm}
              summary={summary}
              officeName={getCurrentOfficeName()}
              openingBalance={summary?.openingBalance || 0}
              closingBalance={summary?.closingBalance || 0}
              totalExpense={summary?.totalExpense || 0}
              totalIncome={summary?.totalIncome || 0}
            />
          )}

          {/* Modals */}
          <ViewExpenseModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            expense={selectedExpense}
            getOfficeName={getOfficeName}
            onImageClick={handleImageClick}
            activeTab={activeTab}
          />

          <ImageModal
            isOpen={imageModalOpen}
            onClose={handleCloseImageModal}
            imageUrl={currentImage || ''}
            title={currentImageTitle}
          />

          <ConfirmDialog
            open={confirmDeleteOpen}
            title={`Delete ${activeTab === 'vendor' ? 'Expense' : 'Petty Cash Record'}`}
            message={`Are you sure you want to delete this ${activeTab === 'vendor' ? 'expense' : 'petty cash record'}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={() => {
              setConfirmDeleteOpen(false);
              setSelectedExpense(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CombinedExpensesScreen;