import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Pettycash extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Office', required: true })
  office: Types.ObjectId;

  @Prop()
  amountSpent?: string;

  @Prop()
  amountRecieve?: string;

  @Prop()
  remainingAmount?: string;

  @Prop({ type: Date, required: true })
  dateOfPayment: Date;

  @Prop()
  transactionNo?: string;

  @Prop()
  chequeNumber?: string;

  @Prop()
  bankName?: string;

  @Prop()
  chequeImage?: string;

  @Prop()
  openingBalance?: string;

  @Prop()
  closingBalance?: string;

  @Prop()
  month?: string;

  @Prop()
  title?: string;

  @Prop()
  description?: string;
}

export const PettycashSchema = SchemaFactory.createForClass(Pettycash);
