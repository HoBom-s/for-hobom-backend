import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseEntity } from "src/shared/response/response.entity";

@Injectable()
export class ResponseWrapInterceptor<T>
  implements NestInterceptor<T, ResponseEntity<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEntity<T>> {
    return next.handle().pipe(map((data) => ResponseEntity.ok(data)));
  }
}
