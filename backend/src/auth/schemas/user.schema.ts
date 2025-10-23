import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Office } from '../../office/schemas/office.schema';

@Schema({ timestamps: true })
export class User extends Document {

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ type: Types.ObjectId, ref: Office.name })
  officeId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);