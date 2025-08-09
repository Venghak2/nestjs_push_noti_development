import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubscribeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    example: "token device"
  })
  token: string;
}
