import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServerErrorService } from './server-error.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private serverError: ServerErrorService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          // Treat server unreachable or 5xx as server errors
          if (!navigator.onLine || (err.status === 0) || (err.status >= 500 && err.status < 600)) {
            this.serverError.showError();
          }
        }
        return throwError(() => err);
      })
    );
  }
}
