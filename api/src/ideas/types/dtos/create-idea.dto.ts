import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  summary: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  description: string;
}
