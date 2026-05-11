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
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { UpdateLocationOtherServicesDto } from '../dto/update-location-other-services.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { FileUploadService } from '../../file-upload/services/file-upload.service';

@ApiTags('Admin — Services')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('upload-url')
  @ApiOperation({ summary: 'Get upload URL for service images (direct Azure upload)' })
  @ApiQuery({ name: 'filename', required: true, example: 'banner.jpg' })
  @ApiQuery({ name: 'type', required: true, enum: ['banner', 'icon'], example: 'banner' })
  @ApiQuery({ name: 'contentType', required: false, example: 'image/jpeg' })
  async getUploadUrl(
    @Query('filename') filename: string,
    @Query('type') type: 'banner' | 'icon',
    @Query('contentType') contentType?: string,
  ) {
    const folder = type === 'banner' ? 'services/banners' : 'services/icons';
    return this.fileUploadService.generateUploadUrl(folder, filename, contentType);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload service image via server' })
  @ApiQuery({ name: 'type', required: true, enum: ['banner', 'icon'], example: 'banner' })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: 'banner' | 'icon',
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const folder = type === 'banner' ? 'services/banners' : 'services/icons';
    const url = await this.fileUploadService.uploadFile(file, folder);
    return { url };
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('other-services')
  @ApiOperation({ summary: 'Get location-specific other services list' })
  @ApiQuery({ name: 'location', required: false, example: 'Abuja' })
  getOtherServices(@Query('location') location?: string) {
    return this.servicesService.getOtherServicesByLocation(location);
  }

  @Post('other-services')
  @ApiOperation({ summary: 'Create or update other services list for a location' })
  saveOtherServices(@Body() dto: UpdateLocationOtherServicesDto) {
    return this.servicesService.upsertOtherServicesByLocation(dto.location, dto.services);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
