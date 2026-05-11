import { Controller, Get, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ContactService } from '../services/contact.service';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Contact')
@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('contact')
  @ApiOperation({ summary: 'Get contact info for all locations or a specific location' })
  @ApiQuery({ name: 'location', required: false, example: 'Abuja' })
  get(@Query('location') location?: string) {
    if (location) {
      return this.contactService.getByLocation(location);
    }
    return this.contactService.getAll();
  }

  @Patch('admin/contact')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create or update contact info for a location' })
  update(@Body() dto: UpdateContactDto) {
    return this.contactService.update(dto);
  }
}
