export interface DashboardStats {
  totalAmount: number;
  totalCount: number;
  totalVendors: number;
  countsByStatus: {
    New: number;
    "Waiting for Approval": number;
    Approved: number;
    "In Review by Finance": number;
    "Preparing for payment": number;
    "Ready for payment": number;
    Paid: number;
  };
}