import { Inject, Injectable, Scope } from '@nestjs/common';
import { I18nService, TranslateOptions } from 'nestjs-i18n';
import { I18nTranslations } from './types/i18n.generated';
import { PathImpl2 } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope : Scope.DEFAULT})
export class TranslateAuthService {
  @Inject(I18nService) private readonly i18n: I18nService<I18nTranslations>;
  constructor() {}

  translate(key: PathImpl2<I18nTranslations>, options?: TranslateOptions): string {
    return this.i18n.translate(key, options);
  }
}

@Injectable({ scope: Scope.REQUEST })
export class TranslateService extends TranslateAuthService {
  @Inject(REQUEST) private readonly req: any;
  constructor() {
    super()
  }

  translate(key: PathImpl2<I18nTranslations>, options?: TranslateOptions): string {
    options = {
      lang:
        this.req.i18nLang || (this.req.raw ? this.req.raw.i18nLang : undefined),
      ...options,
    };
    return super.translate(key, options)
  }
}
