import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        type: String,
        example: '123456',
    })
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @ApiProperty({
        type: String,
        example: '12345678',
    })
    @IsString()
    @IsNotEmpty()
    newPassword: string;
}
