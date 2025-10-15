import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from '../dto/create-expense.dto';

@Schema({ timestamps: true })
export class Expense extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: true })
  vendor: Types.ObjectId;

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

  @Prop({ type: Types.ObjectId, ref: 'Budget' })
  linkedBudgetId?: Types.ObjectId;

  @Prop({ required: true, type: Date })
  billDate: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ default: null, type: Date })
  paymentDate: Date;

  @Prop({ default: Status.WaitingForApproval, enum: Status })
  status: Status;

  @Prop({ default: 0, type: Number })
  WHT: number;

  @Prop({ default: 0, type: Number })
  advanceTax: number;

  @Prop({ default: 0, type: Number })
  amountAfterTax: number;

  @Prop()
  chequeImage?: string;
  
  @Prop()
  paymentSlip?: string;

  @Prop()
  chequeNumber?: string;

  @Prop()
  bankName?: string;

}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);