import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UploadImage{
    @IsString()
    @ApiProperty({
        type: String,
        example: "http://example.com/image.jpg"
    })
    imageUrl: string
}