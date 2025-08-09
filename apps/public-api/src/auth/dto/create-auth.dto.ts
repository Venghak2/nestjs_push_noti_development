import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    @ApiProperty({
        type: String,
        example: "venghak",
        description: "Username for authentication",
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        type: String,
        example: "12345",
        description: "Password for authentication",
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
