import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '@app/common/prisma/prisma.service';
import { TranslateAuthService } from '@app/common/translate';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly translateAuthService: TranslateAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'JWT_SECRET',
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const lang: string = request.headers['lang'] || 'en';
    try {
      const user = await this.prismaService.users.findUniqueOrThrow({
        where: { uid: payload.uid },
      });

      if (!user) {
        this.logger.warn(
          `User with ID ${payload.id} not found for authentication.`,
        );
        throw new ForbiddenException(
          this.translateAuthService.translate('error.ID-NOT-FOUND', {
            lang,
            args: { property: 'User', id: payload.id },
          }),
        );
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Error occurred while authentication by user ${payload.id}:`,
        error,
      );
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException(
        this.translateAuthService.translate('error.ERROR-OCCURRED', {
          lang,
          args: {
            action: this.translateAuthService.translate(
              'error.action.EXIST-TOKEN',
              { lang },
            ),
          },
        }),
      );
    }
  }
}