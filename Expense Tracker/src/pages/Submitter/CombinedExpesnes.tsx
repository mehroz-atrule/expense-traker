import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

// Components
import ImageModal from '../../components/ImageViewModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import CombinedHeader from '../../components/Expesnes/CombinedHeader';
import SearchBar from '../../components/Expesnes/SearchBar';
import DynamicFilters from '../../components/Expesnes/ExpenseFilter';
import VendorExpensesList from '../../components/Expesnes/VendorExpenseList';
import PettyCashExpensesList from '../../components/Expesnes/PettyCashExpenseList';
import ViewExpenseModal from '../../components/Expesnes/viewExpenseModal';
import OfficeTabs from '../../components/Pettycash/officeTabs';
import CreateEditModal from '../../components/Pettycash/createEditModal';

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
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}`; // YYYY-MM format for input type="month"
};

// Helper to convert month format for display


// Helper to convert month format for API
const formatMonthForAPI = (month: string): string => {
  if (!month) return getCurrentMonth();
  const [year, monthNum] = month.split('-');
  return `${monthNum}-${year}`;
};

const CombinedExpensesScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Redux states
  const { expenses = [], total: vendorTotal = 0, loading: vendorLoading } = useAppSelector((s) => s.submitter);
  const { pettyCashRecords = [], total: pettyCashTotal = 0, loading: pettyCashLoading, summary } = useAppSelector((s) => s.pettycash);
  const { offices, loading: officesLoading } = useAppSelector((s) => s.admin);

  // Main state
  const [activeTab, setActiveTab] = useState<ExpenseTab>('vendor');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination
  const [vendorPage, setVendorPage] = useState(1);
  const [pettyCashPage, setPettyCashPage] = useState(1);
  const limit = 10;

  // Office selection for petty cash
  const [selectedOffice, setSelectedOffice] = useState<string>('');

  // Default filters
  const defaultVendorFilters = {
    office: '',
    vendor: '',
    status: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: ''
  };

  const defaultPettyCashFilters = {
    month: getCurrentMonth(),
    transactionType: 'all',
    dateFrom: '',
    dateTo: ''
  };

  // Initialize filters from URL
  const [vendorFilters, setVendorFilters] = useState<VendorFilters>(defaultVendorFilters);
  const [pettyCashFilters, setPettyCashFilters] = useState<PettyCashFilters>(defaultPettyCashFilters);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageTitle, setCurrentImageTitle] = useState('');

  // Create/Edit Modal state for petty cash income
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');

  // Parse URL parameters and set filters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // Get active tab
    const tab = searchParams.get('tab') as ExpenseTab;
    if (tab) {
      setActiveTab(tab);
    }

    // Parse vendor filters from URL
    if (tab === 'vendor' || !tab) {
      const vendorFilterParams: VendorFilters = {
        office: searchParams.get('office') || '',
        vendor: searchParams.get('vendor') || '',
        status: searchParams.get('status') || 'all',
        category: searchParams.get('category') || 'all',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || ''
      };
      setVendorFilters(vendorFilterParams);
    }

    // Parse petty cash filters from URL
    if (tab === 'pettycash') {
      const pettyCashFilterParams: PettyCashFilters = {
        month: searchParams.get('month') || getCurrentMonth(),
        transactionType: searchParams.get('transactionType') || 'all',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || ''
      };
      setPettyCashFilters(pettyCashFilterParams);

      // Set selected office from URL
      const officeFromUrl = searchParams.get('office');
      if (officeFromUrl) {
        setSelectedOffice(officeFromUrl);
      }
    }

    // Set search term from URL
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }

    // Set page from URL
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl) {
      const pageNum = parseInt(pageFromUrl);
      if (tab === 'vendor') {
        setVendorPage(pageNum);
      } else {
        setPettyCashPage(pageNum);
      }
    }
  }, [location.search]);

  // Set default office when offices load
  useEffect(() => {
    if (offices.length > 0 && !selectedOffice && activeTab === 'pettycash') {
      const firstOffice = offices[0]._id!;
      setSelectedOffice(firstOffice);
      // Update URL with default office
      updateURL(pettyCashFilters, 'pettycash', pettyCashPage, searchTerm, firstOffice);
    }
  }, [offices, selectedOffice, activeTab]);

  // Fetch offices
  useEffect(() => {
    if (offices.length === 0) {
      dispatch(fetchOffices() as any);
    }
  }, [dispatch, offices.length]);

  // Fetch data based on active tab and URL parameters
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
    selectedOffice
  ]);

  // Update URL when filters change
  const updateURL = (filters: any, tab: string, page: number, search: string, office?: string) => {
    const searchParams = new URLSearchParams();

    // Always set tab
    searchParams.set('tab', tab);

    // Set search term if exists
    if (search) {
      searchParams.set('search', search);
    }

    // Set page
    searchParams.set('page', page.toString());

    // Set filters based on active tab
    if (tab === 'vendor') {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          searchParams.set(key, value as string);
        }
      });
    } else if (tab === 'pettycash') {
      // For petty cash, set office separately
      if (office) {
        searchParams.set('office', office);
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          searchParams.set(key, value as string);
        }
      });
    }

    navigate(`?${searchParams.toString()}`, { replace: true });
  };

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
    dispatch(fetchExpenses(params) as any);
  };

  const fetchPettyCashData = () => {
    const params: any = {
      q: searchTerm,
      page: pettyCashPage,
      limit,
      month: formatMonthForAPI(pettyCashFilters.month),
      office: selectedOffice || undefined,
    };
    dispatch(fetchPettyCash(params) as any);
  };

  // Handlers
  const handleTabChange = (tabId: string) => {
    const tab = (tabId === 'vendor' || tabId === 'pettycash') ? (tabId as ExpenseTab) : 'vendor';
    setActiveTab(tab);
    setSearchTerm('');
    setShowFilters(false);

    // Reset to first page when switching tabs
    setVendorPage(1);
    setPettyCashPage(1);

    // Update URL with new tab and reset filters
    if (tab === 'vendor') {
      updateURL(defaultVendorFilters, 'vendor', 1, '');
    } else {
      updateURL(defaultPettyCashFilters, 'pettycash', 1, '', selectedOffice);
    }
  };

  const handleCreateNew = () => {
    if (activeTab === 'vendor') {
      navigate('/dashboard/vendor/create-expense');
    } else {
      navigate('/pettycash/create-expense');
    }
  };

  const handleAddIncome = () => {
    if (activeTab === 'pettycash') {
      setIsEditMode(false);
      setSelectedExpense(null);
      // setTransactionType('income');
      setCreateEditModalOpen(true);
    }
  };

  const handleAddExpense = () => {
    if (activeTab === 'pettycash') {
      navigate('/dashboard/pettycash/create-expense');
    }
  };

  const handleNavigateBack = () => {
    navigate(-1);
  };

  // Vendor filter change handler
  const handleVendorFilterChange = (newFilters: VendorFilters) => {
    setVendorFilters(newFilters);
    setVendorPage(1);
    updateURL(newFilters, 'vendor', 1, searchTerm);
  };

  // Petty cash filter change handler
  const handlePettyCashFilterChange = (newFilters: PettyCashFilters) => {
    setPettyCashFilters(newFilters);
    setPettyCashPage(1);
    updateURL(newFilters, 'pettycash', 1, searchTerm, selectedOffice);
  };

  // Office change handler for petty cash
  const handleOfficeChange = (officeId: string) => {
    setSelectedOffice(officeId);
    setPettyCashPage(1);
    updateURL(pettyCashFilters, 'pettycash', 1, searchTerm, officeId);
  };

  // Search handler
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const newPage = 1;

    if (activeTab === 'vendor') {
      setVendorPage(newPage);
      updateURL(vendorFilters, 'vendor', newPage, value);
    } else {
      setPettyCashPage(newPage);
      updateURL(pettyCashFilters, 'pettycash', newPage, value, selectedOffice);
    }
  };

  // Month change handler for petty cash
  const handleMonthChange = (month: string) => {
    setPettyCashFilters(prev => ({ ...prev, month }));
    setPettyCashPage(1);
    updateURL({ ...pettyCashFilters, month }, 'pettycash', 1, searchTerm, selectedOffice);
  };

  // Page change handlers
  const handleVendorPageChange = (newPage: number) => {
    setVendorPage(newPage);
    updateURL(vendorFilters, 'vendor', newPage, searchTerm);
  };

  const handlePettyCashPageChange = (newPage: number) => {
    setPettyCashPage(newPage);
    updateURL(pettyCashFilters, 'pettycash', newPage, searchTerm, selectedOffice);
  };

  // Reset filter handlers
  const handleResetVendorFilters = () => {
    setVendorFilters(defaultVendorFilters);
    setVendorPage(1);
    updateURL(defaultVendorFilters, 'vendor', 1, searchTerm);
  };

  const handleResetPettyCashFilters = () => {
    setPettyCashFilters(defaultPettyCashFilters);
    setPettyCashPage(1);
    updateURL(defaultPettyCashFilters, 'pettycash', 1, searchTerm, selectedOffice);
  };

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    const basePath = location.pathname.split('/')[1]; // Get the base segment (dashboard/admin/etc)
    console.log('Base Path:', basePath);
    if (activeTab === 'vendor') {
      navigate(`/${basePath}/vendor/create-expense?id=${expense._id}`, { state: { expense } });
    } else {
      if (expense.transactionType === 'expense') {
        navigate(`/${basePath}/pettycash/create-expense?id=${expense._id}`);
      } else if (expense.transactionType === 'income') {
        // Open the modal for editing income
        setIsEditMode(true);
        setSelectedExpense(expense);
        setCreateEditModalOpen(true);
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
        await dispatch(removeExpense(selectedExpense._id) as any);
        fetchVendorExpenses();
      } else {
        await (dispatch(deletePettyCashExpenseById(selectedExpense._id) as any)).unwrap?.();
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

  // Handler for CreateEditModal close
  const handleCreateEditModalClose = () => {
    setCreateEditModalOpen(false);
    setSelectedExpense(null);
    setIsEditMode(false);
    // setTransactionType('income');
  };

  // Helper functions
  const getOfficeName = (office: string | { _id?: string; name?: string } | undefined): string => {
    if (!office) return 'N/A';

    if (typeof office === 'string') {
      const found = offices.find((o: any) => o._id === office);
      return found?.name || office;
    }

    if (typeof office === 'object') {
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
        onNavigateBack={handleNavigateBack}
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
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
              onVendorFilterChange={handleVendorFilterChange}
              onPettyCashFilterChange={handlePettyCashFilterChange}
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

          {/* Create/Edit Modal for Petty Cash Income */}
          {activeTab === 'pettycash' && (
            <CreateEditModal
              open={createEditModalOpen}
              editMode={isEditMode}
              selectedItem={selectedExpense}
              offices={offices}
              selectedOffice={selectedOffice}
              onClose={handleCreateEditModalClose}
            />
          )}

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