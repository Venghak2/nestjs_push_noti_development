import {
  HttpException,
  Injectable,
  Inject,
  ExceptionFilter,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { TranslateService } from './translate.service';
import { IException } from './interfaces/exceptions.interface';
import { PathImpl2 } from '@nestjs/config';
import { I18nTranslations } from './types/i18n.generated';

@Injectable()
export class TranslateExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TranslateExceptionFilter.name);
  constructor(
    @Inject(TranslateService)
    private readonly translateService: TranslateService,
  ) {}

  catch(exception: any) {
    this.logger.error(`Exception : ${exception}`);
    try {
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let exceptionResponse: IException = {
        message: this.translateService.translate('error.DATABASE-ERROR'),
        error: 'Internal Server Error',
        statusCode: status,
      };
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        exceptionResponse = exception.getResponse() as IException;
      } else {
        exceptionResponse.message = exception.message;
      }
      if (Array.isArray(exceptionResponse.message)) {
        exceptionResponse.message = exceptionResponse.message.map((msg) => {
          return this.translateMessage(msg);
        });
      } else {
        exceptionResponse.message = this.translateMessage(
          exceptionResponse.message,
        );
      }
      if (exceptionResponse.error) {
        exceptionResponse.error = this.translate(exceptionResponse.error);
      }
      throw new HttpException(exceptionResponse, status);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(error);
      throw new InternalServerErrorException(this.translateService.translate('error.DATABASE-ERROR'));
    }
  }

  translateMessage(key: string): string {
    if (!key) {
      return key;
    }
    const message = key.split('|')[0];
    const valueKey = key.split('|')[1];
    const formattedKey = message as PathImpl2<I18nTranslations>;
    const translatedWord = this.translateService.translate(formattedKey);

    if (!valueKey) {
      return translatedWord;
    }

    const property = JSON.parse(valueKey).message;
    const constraints = JSON.parse(valueKey).constraints;

    if (!constraints) {
      return translatedWord == formattedKey ? key : property + translatedWord;
    }
    const constraintsLength = constraints.map((constraint) => constraint);
    if (
      constraintsLength.length == 1 &&
      typeof constraintsLength[0] != 'number'
    ) {
      return translatedWord == formattedKey ? key : property + translatedWord;
    }
    return this.removeObjectKey(
      translatedWord == formattedKey
        ? key
        : property + translatedWord + ' ' + constraints,
    );
  }

  removeObjectKey(key: string): string {
    return key.replaceAll('[object Object],', '');
  }

  translate(key: string): string {
    if (typeof key !== 'string') {
      return key;
    }
    const formattedKey = ('exception.' +
      key.replaceAll(' ', '').toUpperCase()) as PathImpl2<I18nTranslations>;
    const translatedWord = this.translateService.translate(formattedKey);
    return translatedWord == formattedKey ? key : translatedWord;
  }
}
