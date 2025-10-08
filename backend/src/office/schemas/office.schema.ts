import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Office extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

}

export const OfficeSchema = SchemaFactory.createForClass(Office);
