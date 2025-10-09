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
}

export interface CreateExpensePayload extends Omit<Expense, '_id' | 'createdAt' | 'updatedAt'> {}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;
