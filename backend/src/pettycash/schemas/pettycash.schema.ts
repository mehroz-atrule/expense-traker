import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PettyCashTransactionDocument = PettyCashTransaction & Document;

@Schema({ timestamps: true })
export class PettyCashTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Office', required: true })
  office: Types.ObjectId;

  @Prop({ type: String, enum: ['income', 'expense'], required: true })
  transactionType: 'income' | 'expense';

  @Prop({ type: String, default: '' })
  title: string;
  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, default: 0 })
  debit: number; // expenses

  @Prop({ type: Number, default: 0 })
  credit: number; // incomes

  @Prop({ type: Number, required: true })
  balanceAfter: number; // auto-calculated after each txn

  @Prop({ type: Date, required: true })
  dateOfPayment: Date;

  @Prop({ type: String, default: '' })
  reference: string; // transactionNo or chequeNumber

  @Prop({ type: String, default: '' })
  bankName: string;

  @Prop({ type: String, default: '' })
  chequeImage: string;

  @Prop({ type: String, default: '' })
  month: string; // e.g., "2025-10"

  @Prop({ type: Boolean, default: true })
  isEnable: boolean;
}

export const PettyCashTransactionSchema = SchemaFactory.createForClass(PettyCashTransaction);
