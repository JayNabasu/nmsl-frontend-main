import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PartnersService } from '../services/partners.service';
import { CreatePartnerDto } from '../dto/create-partner.dto';
import { UpdatePartnerDto } from '../dto/update-partner.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { FileUploadService } from '../../file-upload/services/file-upload.service';

@ApiTags('Partners')
@Controller()
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // Public route — active partners only
  @Get('partners')
  @ApiOperation({ summary: 'Get active partners (public)' })
  findActive() {
    return this.partnersService.findActive();
  }

  // Admin routes
  @Get('admin/partners/upload-url')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get upload URL for partner logo (direct Azure upload)' })
  @ApiQuery({ name: 'filename', required: true, example: 'logo.png' })
  @ApiQuery({ name: 'contentType', required: false, example: 'image/png' })
  async getUploadUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType?: string,
  ) {
    return this.fileUploadService.generateUploadUrl('partners', filename, contentType);
  }

  @Post('admin/partners/upload-photo')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload partner logo via server' })
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const url = await this.fileUploadService.uploadFile(file, 'partners');
    return { url };
  }

  @Get('admin/partners')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all partners (admin)' })
  findAll() {
    return this.partnersService.findAll();
  }

  @Post('admin/partners')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a partner' })
  create(@Body() dto: CreatePartnerDto) {
    return this.partnersService.create(dto);
  }

  @Patch('admin/partners/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a partner' })
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(id, dto);
  }

  @Delete('admin/partners/:id')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a partner' })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }

  @Patch('admin/partners/:id/toggle')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle partner active status' })
  toggle(@Param('id') id: string) {
    return this.partnersService.toggle(id);
  }
}
