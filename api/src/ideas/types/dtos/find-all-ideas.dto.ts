import { IsOptional, IsString } from 'class-validator';

export class FindAllIdeasDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
