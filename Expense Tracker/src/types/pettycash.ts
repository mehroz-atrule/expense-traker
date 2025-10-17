export interface PettyCashRecord {
  title?: string;
  description?: string;
  office?: string;
  amountSpent?: string;
  amountRecieve?: string;
  remainingAmount?: string;
  dateOfPayment?: string; // ISO string (e.g. "2025-10-17T11:59:58.402Z")
  transactionNo?: string;
  chequeNumber?: string;
  bankName?: string;
  chequeImage?: string;
  openingBalance?: string;
  closingBalance?: string;
  month?: string;
}
