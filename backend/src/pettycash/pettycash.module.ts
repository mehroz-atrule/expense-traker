import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { PettycashService } from './pettycash.service';
import { PettycashController } from './pettycash.controller';
import { CloudinaryService } from 'src/upload/cloudinary.service';

import { PettyCashTransaction, PettyCashTransactionSchema } from './schemas/pettycash.schema';
import { PettyCashSummary, PettyCashSummarySchema } from './schemas/pettycashsummary.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: PettyCashTransaction.name, schema: PettyCashTransactionSchema },
      { name: PettyCashSummary.name, schema: PettyCashSummarySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [PettycashController],
  providers: [PettycashService, CloudinaryService],
})
export class PettycashModule { }
