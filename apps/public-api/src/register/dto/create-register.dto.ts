import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateRegisterDto {
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "veng",
    })
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "hak",
    })
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "venghak",
    })
    username: string;
    

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "venghak@gmail.com",
    })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "12345",
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "12345",
    })
    confirmPassword: string;

}
