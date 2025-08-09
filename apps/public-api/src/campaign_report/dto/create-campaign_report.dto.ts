import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCampaignReportDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "Campaign 1",
    })
    title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: "This is a sample message for the campaign.",
    })
    message: string;
}
