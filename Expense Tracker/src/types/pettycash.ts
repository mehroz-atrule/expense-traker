// export interface PettyCashRecord {
//     _id?: string;
//   title?: string;
//   description?: string;
//   office?: string;
//   amount?: string;
//   remainingAmount?: string;
//   dateOfPayment?: string; // ISO string (e.g. "2025-10-17T11:59:58.402Z")
//   transactionNo?: string;
//   chequeNumber?: string;
//   bankName?: string;
//   chequeImage?: string | File; // URL or File object
//   openingBalance?: string;
//   closingBalance?: string;
//   month?: string;
// }
// types/pettycash.ts

export interface PettyCashRecord {
  _id: string;
  office: string | {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  transactionType: 'expense' | 'income';
  title: string;
  description: string;
  amount: number;
  debit: number;
  credit: number;
  balanceAfter: number;
  dateOfPayment: string;
  reference: string;
  bankName: string;
  chequeImage: string;
  month: string;
  transactionNo?: string; // Optional field from your form
  chequeNumber?: string; // Optional field from your form
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PettyCashSummary {
  openingBalance: number;
  closingBalance: number;
  note: string;
}

export interface PettyCashResponse {
  data: PettyCashRecord[];
  total: number;
  page: number;
  limit: number;
  summary: PettyCashSummary;
}

export interface PettyCashState {
  pettyCashRecords: PettyCashRecord[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  summary: PettyCashSummary | null;
}

// Form data interface for create/edit
export interface PettyCashFormData {
  office: string;
  amount: string;
  dateOfPayment: string;
  transactionNo: string;
  chequeNumber: string;
  bankName: string;
  chequeImage: string | null;
  month: string;
  title: string;
  description: string;
  reference: string;
  transactionType: 'expense' | 'income';
}