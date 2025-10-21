import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Vendor extends Document {
  @Prop({ required: true, trim: true })
  vendorName: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true, trim: true })
  customerId: string;

  @Prop({ trim: true })
  preferredBankName: string;

  @Prop({ trim: true })
  vendorAccountTitle: string;

  @Prop({ trim: true, match: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/ })
  vendorIban: string;

  @Prop()
  WHT: number;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
