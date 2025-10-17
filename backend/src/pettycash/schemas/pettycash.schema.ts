import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Pettycash extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Office', required: true })
  office: Types.ObjectId;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  dateOfPayment: Date;

  @Prop({ required: true })
  transactionNo?: string;

  // 👇 Relation with Office
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


}

export const PettycashSchema = SchemaFactory.createForClass(Pettycash);