import {
    applyDecorators,
    createParamDecorator,
    ExecutionContext,
  } from '@nestjs/common';
  import { ApiQuery } from '@nestjs/swagger';
  import { SortOrder } from '../dto/pagination-options.dto';
  
  export const PaginationOptions = createParamDecorator(
    (_, ctx: ExecutionContext) => {
      const req = ctx.switchToHttp().getRequest();
  
      const { limit, page, q, order, sort, cursor,startDate,endDate, ...filterParams } = req.query;
      req.filteredQuery = filterParams;
      
      return {
        limit: parseInt(req.query?.limit) || CONFIG.MIN_LIMIT,
        page: parseInt(req.query?.page) || CONFIG.PAGE_DEFAULT,
        search: req.query?.q || null,
        order: req.query?.order || null,
        sort: req.query?.sort || SortOrder.DESC,
        cursor: req.query?.cursor || null,
        startDate: req.query?.startDate || null,
        endDate: req.query?.endDate || null,
      };
    },
  );
  
  export const CONFIG = {
    MIN_LIMIT: 10,
    PAGE_DEFAULT: 1,
    PAGE_MAX: 1000,
  };
  
  export const ApiPaginationQuery = () => {
    return applyDecorators(
      ApiQuery({
        name: 'limit',
        type: Number,
        example: 10,
        required: false,
      }),
      ApiQuery({
        name: 'page',
        type: Number,
        example: 1,
        required: false,
      }),
      ApiQuery({
        name: 'q',
        type: String,
        required: false,
      }),
      ApiQuery({
        name: 'order',
        type: String,
        description: 'เรียงโดย column',
        required: false,
      }),
      ApiQuery({
        name: 'sort',
        type: String,
        enum: SortOrder,
        required: false,
      }),
      ApiQuery({
        name: 'cursor',
        type: Number,
        required: false,
      }),
      ApiQuery({
        name: 'startDate',
        type: Date,
        required: false,
      }),
      ApiQuery({
        name: 'endDate',
        type: Date,
        required: false,
      }),
    );
  };