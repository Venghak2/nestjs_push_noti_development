import { ArgumentsHost, ExceptionFilter, HttpException, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class RmqExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        throw new RpcException(exception.getResponse());
    }
}
