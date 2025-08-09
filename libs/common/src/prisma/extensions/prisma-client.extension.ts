import { PrismaClient } from '@prisma/client';
import {
  filterSoftDeleted,
  pagination,
  softDelete,
} from './prisma.extension';

//function to give us a prismaClient with extensions we want
export const customPrismaClient = (prismaClient: PrismaClient) => {
  return prismaClient
    .$extends(softDelete)
    .$extends(filterSoftDeleted)
    .$extends(pagination);
};

//Our Custom Prisma Client with the client set to the customPrismaClient with extension
export class PrismaClientExtended extends PrismaClient {
  private customPrismaClient: CustomPrismaClient
  get custom() {
    return this.customPrismaClient ? this.customPrismaClient : customPrismaClient(this);
  }
}

//Create a type to our funtion
export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;