import { PartialType } from '@nestjs/swagger';
import { CreatePettycashDto } from './create-pettycash.dto';

export class UpdatePettycashDto extends PartialType(CreatePettycashDto) {}
