import { Module } from '@nestjs/common';
import { PettycashService } from './pettycash.service';
import { PettycashController } from './pettycash.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Pettycash, PettycashSchema } from './schemas/pettycash.schema';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from 'src/upload/cloudinary.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Pettycash.name,
        schema: PettycashSchema,
      },
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
