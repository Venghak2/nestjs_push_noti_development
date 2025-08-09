import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '@app/common/decorator';
import { TranslateService } from '@app/common/translate';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly translateService: TranslateService,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    const { username, password } = createAuthDto;

    try {
      const checkuser = await this.validateUser(username, password);
      if (checkuser != null) {
        const payload = {
          email: username.toLocaleLowerCase(),
          sub: checkuser.uid,
          uid: checkuser.uid,
        };
        this.logger.log(
          `username : ${username} - login success - ${new Date()}`,
        );
        const access_token = this.jwtService.sign(payload);

        return {
          isSuccess: true,
          message: this.translateService.translate("success.SUCCESS", {
            args: {
              property: this.translateService.translate("property.LOGIN")
            }
          }),
          data: {
            ...checkuser,
            access_token,
          },
        };
      }

      this.logger.warn(`username : ${username} - login failed - ${new Date()}`);
      throw new UnauthorizedException(
        this.translateService.translate('error.LOGIN-FAILED'),
      );
    } catch (err) {
      this.logger.error(`Error during login: ${err.message}`);
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException(
        this.translateService.translate(err.message ?? err),
      );
    }
  }

  async validateUser(username: string, password: string) {
    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [{ email: username.toLocaleLowerCase() }, { username: username }],
      },
    });

    if (user && (await comparePassword(password, user.password))) {
      return user;
    }
    return null;
  }
}
