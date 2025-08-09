import {
    BadRequestException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CreateRegisterDto } from './dto/create-register.dto';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TranslateService } from '@app/common/translate';

@Injectable()
export class RegisterService {
    private readonly logger = new Logger(RegisterService.name);
    constructor(
        private readonly prismaService: PrismaService,
        private readonly translateService: TranslateService
    ) { }

    async register(createRegisterDto: CreateRegisterDto) {
        const { firstName, lastName, username, email, password, confirmPassword } =
            createRegisterDto;
        try {
            await this.existUsers(username, email);
            if (password !== confirmPassword) {
                throw new BadRequestException(
                    this.translateService.translate('error.PASSWORD-MISMATCH')
                );
            }
            const setPassword = await bcrypt.hash(password, 10);
            const user = await this.prismaService.users.create({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    username,
                    email: email.toLocaleLowerCase(),
                    password: setPassword,
                },
            });
            this.logger.log(`Create user successfully: ${user}`);
            return {
                isSuccess: true,
                message: this.translateService.translate("success.USER-REGISTERED-SUCCESS"),
                data: user
            };
        } catch (err) {
            this.logger.error(`Failed to register user: ${err.message}`);
            if (err instanceof HttpException) throw err;
            throw new InternalServerErrorException(
                this.translateService.translate(err.message ?? err)
            );
        }
    }

    async existUsers(username: string, email: string) {
        const user = await this.prismaService.users.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (user?.username === username) {
            throw new NotFoundException(
                this.translateService.translate('error.REGISTER-EXIST', {
                    args: {
                        property: this.translateService.translate("property.USERNAME"),
                        data: username
                    },
                })
            );
        } else if (user?.email === email) {
            throw new NotFoundException(
                this.translateService.translate('error.REGISTER-EXIST', {
                    args: { property: 'Email', data: email },
                })
            );
        }
    }
}
