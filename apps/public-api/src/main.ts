import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { RmqService } from '@app/common/rmq/rmq.service';
import { ServicesEnum } from '@app/common/enums/services.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  app.enableCors()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Push Notification API')
    .setDescription('API user for register of Push Notification service')
    .addBearerAuth({type: 'http', scheme: 'bearer', bearerFormat: 'token'})
    .setVersion('1.0')
    .addServer('user')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docsapi', app, document,{
    swaggerOptions: {
      persistAuthorization: true,
    },
  }); 
  
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(ServicesEnum.PUBLIC_SERVICE));
  await app.startAllMicroservices();

  app.setGlobalPrefix('user')

  await app.listen(7000);
}
bootstrap();