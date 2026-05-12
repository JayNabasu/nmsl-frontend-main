import { Controller, Get, Post, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  constructor(
    private readonly contactService: ContactService,
    private readonly emailService: EmailService,
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
  @ApiOperation({ summary: 'Submit contact form message (public)' })
  async submitContactForm(@Body() dto: ContactFormDto) {
    try {
      const location = dto.location || 'Abuja';

      // Try to find recipient email from contact info
      let recipientEmail: string | undefined;
      try {
        const contactInfo = await this.contactService.getByLocation(location);
        recipientEmail = contactInfo?.contactFormRecipient || contactInfo?.emailPrimary;
      } catch {
        // Column may not exist yet - ignore
      }

      if (!recipientEmail) {
        // Fallback: try Abuja contact info
        try {
          const fallback = await this.contactService.getByLocation('Abuja');
          recipientEmail = fallback?.contactFormRecipient || fallback?.emailPrimary;
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
