import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsNotEmpty, IsUUID} from "class-validator";

export class CreateCampaignScheduleDto {

    @IsNotEmpty()
    @IsUUID(undefined,{each: true})
    @ApiProperty({
        type: String,
        example: '0198353d-dee2-79d1-ab8a-11b336059f38'
    })    
    draftUId: string;

    @IsArray()
    @IsDate({ each: true })
    @Type(() => Date)
    @ApiProperty({
        type: [Date],
        example: ['2025-08-06T16:00:00+07:00', '2025-08-06T16:05:00+07:00'],
        description: 'Array of scheduled send dates and times',
    })
    datetimeSend: Date[];
}
