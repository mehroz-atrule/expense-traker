import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PettyCashSummaryDocument = PettyCashSummary & Document;

@Schema({ timestamps: true })
export class PettyCashSummary {
  @Prop({ type: Types.ObjectId, ref: 'Office', required: true })
  office: Types.ObjectId;

  @Prop({ type: String, required: true }) // e.g., "October" or "2025-10"
  month: string;

  @Prop({ type: Number, default: 0 })
  openingBalance: number;

  @Prop({ type: Number, default: 0 })
  closingBalance: number;
}

export const PettyCashSummarySchema = SchemaFactory.createForClass(PettyCashSummary);
