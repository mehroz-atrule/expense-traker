export interface Expense {
  _id?: string;
  title: string;
  vendor: string; // references Vendor _id as string
  amount: string; // kept as string to match existing slice/api
  category: string;
  office: string;
  payment: string;
  description?: string;
  image?: string;
  billDate?: string;      // new: mandatory in form but optional in API
  dueDate?: string;       // new
  paymentDate?: string;   // new, optional
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  WHT?: number|string; // tax percentage from vendor (Withholding Tax)
  advanceTax?: number; // calculated/entered advance tax amount
  amountAfterTax?: number | string; // calculated amount after tax deduction
  chequeImage?: string; // URL or base64 string of cheque image
  paymentSlip?: string; // URL or base64 string of payment slip image
  chequeNumber?: string; // new: cheque number if payment is by cheque
  bankName?: string;   // new: bank name if payment is by cheque
  expenseDate?: string; // new: date when the expense was incurred
  paymentMethod?: string; // new: method of payment (e.g., Credit Card, Cheque, etc.)
}

export interface CreateExpensePayload extends Omit<Expense, '_id' | 'createdAt' | 'updatedAt'> {}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;
