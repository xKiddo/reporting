import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Observation } from '../interfaces/observation';

@Injectable({
  providedIn: 'root'
})
export class ObservationsService {

  private readonly observationsEndpoint = 'api/observations';
  private savedObservations: Observation[] = [];

  get allAddedObservations(): Observation[] { return this.savedObservations; }
  set allAddedObservations(observations: Observation[]) { this.savedObservations = observations; }

  constructor(
    private http: HttpClient
  ) {}

  getObservations(): Observable<Observation[] | undefined> {
    if (!this.observationsEndpoint) {
      return of(undefined);
    }

    return this.http.get<Observation[]>(this.observationsEndpoint);
  }
}
