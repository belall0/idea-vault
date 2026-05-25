import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';

import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './types/dtos/create-idea.dto';
import { UpdateIdeaDto } from './types/dtos/update-idea.dto';
import { FindAllIdeasDto } from './types/dtos/find-all-ideas.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/types';

@Controller('ideas')
export class IdeasController {
  constructor(private ideasService: IdeasService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  findAll(
    @GetUser() user: AuthenticatedUser | undefined,
    @Query() query: FindAllIdeasDto,
  ) {
    let { userId } = query;

    if (userId === 'me') {
      if (!user) {
        throw new UnauthorizedException(
          'Authentication required to use userId=me',
        );
      }
      userId = user.id;
    }

    return this.ideasService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ideasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@GetUser('id') userId: string, @Body() createIdeaDto: CreateIdeaDto) {
    return this.ideasService.create(userId, createIdeaDto);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateIdeaDto: UpdateIdeaDto,
  ) {
    return this.ideasService.update(userId, id, updateIdeaDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.ideasService.remove(userId, id);
  }
}
