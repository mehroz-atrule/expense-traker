import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  vendor: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  category: string;

  // 👇 Relation with Office
  @Prop({ type: Types.ObjectId, ref: 'Office', required: true })
  office: Types.ObjectId;

  @Prop({ required: true, enum: ['Cash', 'Cheque', 'BankTransfer', 'Card'] })
  payment: 'Cash' | 'Cheque' | 'BankTransfer' | 'Card';

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  // Link to Budget if exists
  @Prop({ type: Types.ObjectId, ref: 'Budget' })
  linkedBudgetId?: Types.ObjectId;

  @Prop({ required: true })
  expenseDate: Date;

  @Prop({ default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] })
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';

}

// 👇 Schema Factory
export const ExpenseSchema = SchemaFactory.createForClass(Expense);