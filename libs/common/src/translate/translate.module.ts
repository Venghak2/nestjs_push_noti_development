import { Global, Module, Scope } from '@nestjs/common';
import { TranslateAuthService, TranslateService } from './translate.service';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { APP_FILTER } from '@nestjs/core';
import { TranslateExceptionFilter } from './translate.filter';

@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        'en-*': 'en',
        'th-*': 'th',
      },
      loaderOptions: {
        path: path.join(__dirname,'translate/i18n'),
      },
      typesOutputPath: path.join('./libs/common/src/translate/types/i18n.generated.ts'),
      resolvers: [

        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  providers: [
    TranslateService,
    TranslateAuthService,
    {
      provide: APP_FILTER,
      scope: Scope.REQUEST,
      useClass: TranslateExceptionFilter,
    },
  ],
  exports: [TranslateService, TranslateAuthService],
})
export class TranslateModule { }
