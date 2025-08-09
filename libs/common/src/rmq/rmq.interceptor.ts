import { Injectable, CallHandler, ExecutionContext, NestInterceptor, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class RmqAckInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RmqAckInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const channel = rmqContext.getChannelRef();
    const originalMessage = rmqContext.getMessage();
    return next.handle().pipe(
      tap(() => {
        channel.ack(originalMessage);
      }),
      catchError((e) => {
        this.logger.error(`Error caught in interceptor: ${e.message}`, e.stack);
        channel.nack(originalMessage, false, false); 
        return throwError(() => e);
      }),
    );
  }
}
