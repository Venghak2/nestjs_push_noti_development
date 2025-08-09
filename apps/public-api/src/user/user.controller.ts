import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GlobalLanguageApiHeader, User } from '@app/common/decorator';
import { users } from '@prisma/client';
import { UploadImage } from './dto/upload-image.dto';

@GlobalLanguageApiHeader()
@Controller('user')
@ApiTags('USER')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  profile(@User() user: users) {
    return this.userService.profile(user.uid);
  }

  @Post('change-password')
  changePassword(
    @User() user: users,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user, changePasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Patch('upload-image')
  async uploadImage(@Body() uploadImage: UploadImage, @User() user: users) {
    return this.userService.uploadImageUser(uploadImage, user);
  }
}
