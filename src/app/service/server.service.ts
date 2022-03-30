import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Status } from '../enum/status.enum';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiUrl:string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  //reactive approach
  // $ used when defining observables
  //get all servers
  servers$ = <Observable <CustomResponse>> 
    this.http.get<CustomResponse> (`${this.apiUrl}/server/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  //save new server
  save$ = (server: Server) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.apiUrl}/server/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  //ping server
  ping$ = (ipAddress: string) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  //filter servers - Observable - not calling back-end
  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        console.log(response);
        //call next to emit new value for subscriber
        subscriber.next(
          status === Status.ALL ? { ...response, message:`Servers filtered by ${status} status` } :
          {
            ...response,
            message: response.data.servers && response.data.servers.filter(server => server.status === status).length > 0 ?
              `Servers filtered by ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'} status` :
              `No servers of ${status} found`,
            data: { servers: response.data.servers && response.data.servers.filter(server => server.status === status) }
          }
        );
        //call complete to end
        subscriber.complete();
      }
    )
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  //delete server
  delete$ = (serverId: number) => <Observable<CustomResponse>>
    this.http.delete<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError('Error occured - Error code: ' + error.status);
  }
}

