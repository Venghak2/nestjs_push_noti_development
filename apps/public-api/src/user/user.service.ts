import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { comparePassword } from 'libs/common/src/decorator/comparePassword.decorator';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UploadImage } from './dto/upload-image.dto';
import { users } from '@prisma/client';
import { dayjsTz } from '@app/common/dayjs';
import { TranslateService } from '@app/common/translate';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly translateService: TranslateService
  ) { }

  async getUserById(uid: string) {
    const user = await this.prismaService.users.findFirst({
      where: { uid: uid },
    });
    if (!user) {
      throw new NotFoundException(
        this.translateService.translate('error.ID-NOT-FOUND', {
          args: {
            property: this.translateService.translate("property.USER"),
            id: uid
          },
        })
      );
    }
    return user;
  }

  async profile(uid: string) {
    const user = await this.getUserById(uid);
    const { password, remember_token, balance, ...dataUser } = user;
    return {
      isSuccess: true,
      data: {
        ...dataUser,
        balance: balance.toNumber()
      },
    };
  }

  async changePassword(user: users, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const checkUser = await this.getUserById(user.uid);

      const isValidPassword = await comparePassword(oldPassword, user.password);
      if (!isValidPassword) {
        throw new BadRequestException(
          this.translateService.translate('error.PASSWORD-MISMATCH')
        );
      }

      await this.prismaService.users.update({
        where: { uid: checkUser.uid },
        data: { password: hashedPassword },
      });

      this.logger.log(`Password changed successfully for user UID: ${user.uid}`);
      return {
        isSuccess: true,
        message: this.translateService.translate('success.PASSWORD-UPDATED-SUCCESS'),
      };
    } catch (err) {
      this.logger.error(`Failed to change password: ${err.message}`);
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await this.prismaService.users.findFirst({
        where: { email: email },
      });
      if (!user) {
        throw new NotFoundException(
          this.translateService.translate('error.NOT-FOUND', {
            args: { property: 'Email:', data: email },
          })
        );
      }

      await this.prismaService.users.update({
        where: { uid: user.uid },
        data: { password: hashedPassword },
      });

      return {
        isSuccess: true,
        message: this.translateService.translate('success.PASSWORD-RESET-SUCCESS'),
      };
    } catch (err) {
      this.logger.error(`Failed to reset password: ${err.message}`);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }

  async uploadImageUser(uploadImage: UploadImage, user: users) {
    const now = dayjsTz();
    try {
      const checkUser = await this.getUserById(user.uid);
      await this.prismaService.users.update({
        where: { uid: checkUser.uid },
        data: {
          icon_url: uploadImage.imageUrl
        },
      });

      return {
        isSuccess: true,
        message: this.translateService.translate('success.IMAGE-UPLOAD-SUCCESS'),
      };
    } catch (err) {
      this.logger.error('Fail upload image for user.');
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err)
      );
    }
  }
}
