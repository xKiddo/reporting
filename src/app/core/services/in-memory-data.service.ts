import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import { Observation } from '../interfaces/observation';
import { Report } from '../interfaces/report';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {

  createDb(_reqInfo?: RequestInfo | undefined): {} | Observable<{}> | Promise<{}> {

    const observations: Observation[] = [
      {
        id: 1,
        name: "Marche"
      },
      {
        id: 2,
        name: "Arrêt"
      },
      {
        id: 3,
        name: "Anomalie"
      },
      {
        id: 4,
        name: "Dysfonctionnement"
      },
      {
        id: 5,
        name: "Redémarrage"
      },
      {
        id: 6,
        name: "Démarrage"
      },
      {
        id: 7,
        name: "Hors Tension"
      },
      {
        id: 8,
        name: "Coupure"
      },
      {
        id: 9,
        name: "Ouvert"
      },
      {
        id: 10,
        name: "Fermé"
      }
    ];

    const report: Report[] = [];

    return { observations, report };
  }
}
