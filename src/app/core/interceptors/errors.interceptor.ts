import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { catchError, concatMap, delay, of, retryWhen, throwError } from "rxjs";

// export const errorsInterceptor : HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>{
//   return next(req,);
//     return next(req).pipe(
//         catchError((error: HttpErrorResponse) => {
//           let errorMessage = '';
//           if (error.error instanceof ErrorEvent) {
//             errorMessage = `Error: ${error.error.message}`;
//           } else if (isECONNREFUSED(error)) {
//             errorMessage = `Error: Connection refused by the server. Please try again later.`;
//           } else {
//             errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
//           }
//           console.error(errorMessage);  
//           return of();
//           //return throwError(() => new Error(errorMessage));
//         })
//       );

// }

// export const isECONNREFUSED = (error: HttpErrorResponse): boolean => {
//     return error.message.includes('ECONNREFUSED');
// }
