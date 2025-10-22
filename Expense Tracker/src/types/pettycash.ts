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
  transactionNo?: string;
  chequeNumber?: string;
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

// ✅ Form data interface for create/edit - Fix the syntax error
export interface PettyCashFormData {
  office: string;
  amount: string;
  dateOfPayment: string;
  transactionNo?: string;
  chequeNumber?: string;
  bankName?: string;
  chequeImage: File | null;  // ✅ Syntax error fix - semicolon add karo
  month: string;
  title: string;
  description: string;
  reference?: string;
  transactionType?: 'expense' | 'income';
}