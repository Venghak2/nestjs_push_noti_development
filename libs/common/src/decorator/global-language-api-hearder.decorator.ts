import { ApiHeader } from '@nestjs/swagger';
import { applyDecorators, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SupportLanguage } from '../enums/SupportLanguage.enum';
import { Request as IRequest} from 'express';

export const Language = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req: IRequest = ctx.switchToHttp().getRequest();
    return GetLanguage(req);
  },
);

export const GetLanguage = (req: IRequest) => {
  const language = req.headers["lang"] as string || req.headers['language'] || req.headers['accept-language'] || 'en';
  return language;
}

export function GlobalLanguageApiHeader() {
  const supportLanguages = Object.values(SupportLanguage);

  return applyDecorators(
    ApiHeader({
      name: 'Accept-Language',
      description: 'Language preference for the response',
      required: true,
      schema: {
        type: 'string',
        enum: supportLanguages,
      },
    }),
  );
}
