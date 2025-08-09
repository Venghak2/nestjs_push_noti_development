import { IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCampaignScheduleDto {
    @IsDate({ each: true })
    @ApiProperty({
        type: Date,
        example: '2025-07-11T09:00:00.000Z',
        description: 'set datetime campaign schedule',
    })
    datetimeSend: Date;
}
