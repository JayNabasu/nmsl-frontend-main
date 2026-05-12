import { Controller, Get, Post, Patch, Body, UseGuards, Query, Logger, Req } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInfo } from '../entities/contact-info.entity';
import { ContactService } from '../services/contact.service';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ContactFormDto } from '../dto/contact-form.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { EmailService } from '../../notifications/services/email.service';

@ApiTags('Contact')
@Controller()
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(
    private readonly contactService: ContactService,
    private readonly emailService: EmailService,
    @InjectRepository(ContactInfo)
    private readonly contactRepository: Repository<ContactInfo>,
  ) {}

  @Get('contact')
  @ApiOperation({ summary: 'Get contact info for all locations or a specific location' })
  @ApiQuery({ name: 'location', required: false, example: 'Abuja' })
  get(@Query('location') location?: string) {
    if (location) {
      return this.contactService.getByLocation(location);
    }
    return this.contactService.getAll();
  }

  @Post('contact/send')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 300 } })
  @ApiOperation({ summary: 'Submit contact form message (public, max 3 per 5 minutes)' })
  async submitContactForm(@Body() dto: ContactFormDto) {
    try {
      const location = dto.location || 'Abuja';
      let recipientEmail: string | undefined;

      // Try raw query to avoid column-not-found errors if migration hasn't run
      try {
        const rows = await this.contactRepository.query(
          `SELECT "contactFormRecipient" FROM "contact_info" WHERE "location" = $1 LIMIT 1`,
          ['__global__'],
        );
        recipientEmail = rows?.[0]?.contactFormRecipient || undefined;
        this.logger.log(`Global recipient lookup: ${recipientEmail || 'not set'}`);
      } catch (e) {
        this.logger.warn(`contactFormRecipient column query failed: ${e.message}`);
        // Column may not exist - try emailPrimary instead
      }

      // Fallback to location's primary email
      if (!recipientEmail) {
        try {
          const rows = await this.contactRepository.query(
            `SELECT "emailPrimary" FROM "contact_info" WHERE "location" = $1 LIMIT 1`,
            [location],
          );
          recipientEmail = rows?.[0]?.emailPrimary || undefined;
        } catch {
          // ignore
        }
      }

      if (!recipientEmail) {
        return { success: false, message: 'No recipient email configured. Please try again later.' };
      }

      await this.emailService.sendContactFormEmail({
        recipientEmail,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        location,
      });

      return { success: true, message: 'Your message has been sent successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to send message. Please try again later.' };
    }
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
