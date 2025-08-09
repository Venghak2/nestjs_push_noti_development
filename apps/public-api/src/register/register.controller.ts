import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { CreateRegisterDto } from './dto/create-register.dto';
import { ApiTags } from '@nestjs/swagger';
import { GlobalLanguageApiHeader } from '@app/common/decorator';

@GlobalLanguageApiHeader()
@Controller('register')
@ApiTags('REGISTER')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) { }

  @Post()
  create(@Body() createRegisterDto: CreateRegisterDto) {
    return this.registerService.register(createRegisterDto);
  }
}
