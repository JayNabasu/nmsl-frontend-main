import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SiteSettingsService } from '../services/site-settings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Site Settings')
@Controller()
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  /** Public — anyone (including the frontend) can read feature flags. */
  @Get('site-settings')
  @ApiOperation({ summary: 'Get public site settings / feature flags' })
  get() {
    return this.siteSettingsService.get();
  }

  /** Admin-only — toggle features. */
  @Patch('admin/site-settings')
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update site settings (admin only)' })
  update(@Body() dto: { telemedicineEnabled?: boolean }) {
    return this.siteSettingsService.update(dto);
  }
}
