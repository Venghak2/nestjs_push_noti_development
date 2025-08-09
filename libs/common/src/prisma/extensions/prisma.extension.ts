import { dayjsTz, dayjsUTC } from '@app/common/dayjs/dayjs';
import {
  IPaginationOptions,
  PaginationOptionsResponseDto,
  SortOrder,
} from '@app/common/dto/pagination-options.dto';
import { Prisma } from '@prisma/client';
import { Operation } from '@prisma/client/runtime/library';
const softDeleteFilterOperation: Operation[] = [
  'findFirst',
  'findFirstOrThrow',
  'findUnique',
  'findUniqueOrThrow',
  'findMany',
  'count',
  'aggregate',
];
//extension for soft delete Many
export const softDelete = Prisma.defineExtension((client) =>
  client.$extends({
    query: {
      $allModels: {
        async delete({ model, args, query }) {
          if (Object.keys(client[model].fields).includes('deleted_at')) {
            //@ts-ignore ignore prisma incompatible call other function
            return client[model].update({
              where: args.where,
              data: {
                deleted_at: dayjsUTC()
              }
            })
          }
          return query(args);
        },

        async deleteMany({ model, args, query }) {
          if (Object.keys(client[model].fields).includes('deleted_at')) {
            //@ts-ignore ignore prisma incompatible call other function
            return client[model].updateMany({
              where: args.where,
              data: {
                deleted_at: dayjsUTC()
              }
            })
          }
          // Hard delete
          return query(args);
        },

        async $allOperations({ model, operation, args, query }) {
          if (softDeleteFilterOperation.includes(operation as Operation) && Object.keys(client[model].fields).includes('deleted_at')) {
            const anyArgs = args as any
            anyArgs.where = { ...anyArgs.where, deleted_at: null };
            return query(anyArgs);
          }
          return query(args);
        },
      },
    },
  })
);
//extension for filtering soft deleted rows from queries
export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (softDeleteFilterOperation.includes(operation)) {
          const anyArgs = args as any;

          const modelDefinition = Prisma.dmmf.datamodel.models.find(
            (m) => m.name === model,
          );
          if (modelDefinition) {
            const hasDeletedAtField = modelDefinition.fields.some(
              (field) => field.name === 'deleted_at',
            );

            if (hasDeletedAtField) {
              anyArgs.where = { ...anyArgs.where, deleted_at: null };
              return query(anyArgs);
            }
          }
        }
        return query(args);
      },
    },
  },
});

export const pagination = Prisma.defineExtension({
  name: 'pagination',
  model: {
    $allModels: {
      async pagination<M, A>(
        this: M,
        options: IPaginationOptions,
        args?: Prisma.Args<M, 'findMany'>,
      ): Promise<PaginationOptionsResponseDto> {
        const paginationDefaultArgs: any = {
          ...args,
          orderBy: {
            [options.order || 'uid' || 'created_at']: options.sort || SortOrder.DESC,
          },
        }
        if (options.limit != 0) {
          paginationDefaultArgs.skip = options.cursor ? 1 : (options.page - 1) * options.limit;
          paginationDefaultArgs.take = options.limit > 100 ? 100 : options.limit;
          paginationDefaultArgs.cursor = options.cursor ? { id: options.cursor } : undefined;
        }
        const snapshot = await (this as any).findMany(paginationDefaultArgs);
        const fields = Object.keys((this as any).fields);
        const count = await (this as any).count({
          ...args,
          select: { [fields[0]]: true },
        });
        return {
          items: snapshot,
          total: count[fields[0]],
          totalPage: options.limit > 0 ? Math.ceil(count[fields[0]] / options.limit) : 1,
          page: options.page,
          limit: options.limit,
          cursor: snapshot.length > 0 ? snapshot[snapshot.length - 1]?.id : 1,
        };
      },
    },
  },
});

export const isExist = Prisma.defineExtension({
  name: 'isExist',
  model: {
    $allModels: {
      async isExist<M, A>(
        this: M,
        args?: Prisma.Args<M, 'findFirst'>,
      ): Promise<Boolean> {
        const snapshot = await (this as any).findOne({
          ...args,
        });
        return snapshot ? true : false;
      },
    },
  },
});

export function searchWhereLike<W, S>(
  search: string | null,
  or: Partial<S>,
): W[] {
  if (search && search.trim().length > 0) {
    const nestedWhereLikeArray = Object.entries(or).reduce((pre, [key, value]: [string, any]) => {
      const whereSearch = nestedRecursiveWhereLike<W>(search, key, value)
      return [...pre, ...(Array.isArray(whereSearch) ? whereSearch : [whereSearch])]
    }, [] as W[])
    return nestedWhereLikeArray
  }
  return [];
}

interface Select {
  [key: string]: Boolean | NestedSelect;
}

interface NestedSelect {
  select: Select;
}

function isNestedSelect(value: any): value is NestedSelect {
  return value && value.select;
}

function nestedRecursiveWhereLike<W>(search: string, key: string, value: Boolean | NestedSelect): W[] | W {
  if (typeof value === 'boolean') {
    return {
      [key]: {
        contains: search,
        mode: 'insensitive',
      },
    } as W;
  }
  if (isNestedSelect(value)) {
    return Object.entries(value.select).map(([nestedKey, nestedValue]) => {
      return {
        [key]: nestedRecursiveWhereLike(search, nestedKey, nestedValue)
      }
    }) as W[];
  }
  return {} as W;
}