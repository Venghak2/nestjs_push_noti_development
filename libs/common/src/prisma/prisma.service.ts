import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { customPrismaClient, PrismaClientExtended } from './extensions'

@Injectable()
export class PrismaService extends PrismaClientExtended implements OnModuleInit, OnModuleDestroy{
  constructor() {
    super()
    const prismaClientSoftDelete = customPrismaClient(this)
    Object.assign(this, prismaClientSoftDelete)
  }
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
