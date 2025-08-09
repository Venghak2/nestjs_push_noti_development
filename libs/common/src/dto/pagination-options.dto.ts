import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class IPaginationOptions {
  @ApiProperty({
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Min(1)
  limit: number = 10;

  @ApiProperty({
    required: false,
    default: null,
  })
  @IsOptional()
  @IsNumber()
  cursor?: number | null = null;

  @ApiProperty({
    required: false,
    default: 'uid',
  })
  @IsOptional()
  @IsString()
  order?: string | null;

  @ApiProperty({
    type: String,
    enum: SortOrder,
    required: false,
    default: 'asc',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort?: 'asc' | 'desc' = 'asc';

  @ApiProperty({
    type: String,
    required: false,
    default: null,
  })
  @IsOptional()
  @IsString()
  search?: string | null;

  @ApiProperty({
    type: Date,
    required: false,
    default: null,
  })
  @IsDate()
  @IsOptional()
  startDate?: Date | null;

  @ApiProperty({
    type: Date,
    required: false,
    default: null,
  })
  @IsDate()
  @IsOptional()
  endDate?: Date | null;

}


export class PaginationOptionsResponseDto{
  items: any[];

  total: number;

  totalPage: number;

  page: number;

  limit: number;

  cursor: number;
}