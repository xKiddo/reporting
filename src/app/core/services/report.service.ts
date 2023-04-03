import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { catchError, Observable, of, tap } from 'rxjs';
import { Author } from '../interfaces/author';
import { Observation } from '../interfaces/observation';
import { Report } from '../interfaces/report';
import { ObservationsService } from './observations.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly reportEndpoint = 'api/report';
  private reports: Report[] = [];
  private form: FormGroup | undefined;
  private reportIndex = 1;
  private formEditMode = false;

  get allReports(): Report[] { return this.reports; }
  set allReports(reports: Report[]) { this.reports = reports; }
  get reportForm(): FormGroup | undefined { return this.form; }
  get isFormEditMode(): boolean { return this.formEditMode; }
  set isFormEditMode(value: boolean) { this.formEditMode = value; }

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder
  ) {
    this.form = this.buildForm();
  }

  editReport(report: Report | undefined): void {
    if (!report || !report.author || !this.reportForm) {
      return;
    }

    this.isFormEditMode = true;

    this.reportForm.patchValue({
      index: report.id !== undefined ? report.id : 0,
      author: {
        firstName: report.author.first_name ? report.author.first_name : '',
        lastName: report.author.last_name ? report.author.last_name : '',
        birthDate: report.author.birth_date ? report.author.birth_date : '',
        email: report.author.email ? report.author.email : '',
        sex: report.author.sex ? report.author.sex : ''
      },
      description: report.description ? report.description : '',
      observations: report.observations ? this.manageObservations(report.observations) : {}
    });
  }

  getReport(): Observable<Report[] | undefined> {
    if (!this.reportEndpoint) {
      return of(undefined);
    }

    return this.http.get<Report[]>(this.reportEndpoint).pipe(tap({
      next: (response: Report[] | undefined) => {
        if (response && response.length > 0) {
          this.allReports = response;
        }
      },
      error: () => console.log('Get Reports Error')
    }));
  }

  postReport(report: Report | undefined): Observable<Report | undefined> {
    if (!report) {
      return of(undefined);
    }

    if (!this.reportEndpoint) {
      return of(undefined);
    }

    return this.http.post<Report>(this.reportEndpoint, report, httpOptions).pipe(tap({
      next: (response: Report | undefined) => {
        if (response && this.allReports) {
          this.allReports.push(response);
          this.reportIndex++;
        }
      },
      error: () => console.log('Post Report Error')
    }));
  }

  updateReport(report: Report | undefined): Observable<Report | undefined> {
    if (!report || report.id === undefined) {
      return of(undefined);
    }

    if (!this.reportEndpoint) {
      return of(undefined);
    }

    const id = report.id;

    return this.http.put<Report>(this.reportEndpoint, report, httpOptions).pipe(tap({
      next: () => {
        if (this.allReports && this.allReports.length > 0) {
          const index = this.allReports
            .findIndex(report => report && report.id !== undefined && id !== undefined && report.id === id);
          if (index !== undefined) {
            this.allReports[index] = report;
          }
        }
      },
      error: () => console.log('Update Report Error')
    }));
  }

  deleteReport(id: number | undefined): Observable<unknown | undefined> {
    if (id === undefined) {
      return of(undefined)
    }

    if (!this.reportEndpoint) {
      return of(undefined);
    }

    const url = `${this.reportEndpoint}/${id}`;

    return this.http.delete(url, httpOptions).pipe(tap({
      next: () => {
        this.allReports = this.allReports.filter(report => report && report.id !== undefined && report.id !== id);
      },
      error: () => console.log('Delete Report Error')
    }));
  }

  buildObjectRequest(): Report | undefined {
    if (!this.reportForm) {
      return;
    }

    const formValues = this.reportForm.getRawValue();

    if (!formValues) {
      return;
    }

    const report = {} as Report;
    report.id = this.formEditMode ? formValues.index : this.reportIndex;
    report.author = {} as Author;
    report.author.first_name = formValues.author.firstName;
    report.author.last_name = formValues.author.lastName;
    report.author.birth_date = typeof formValues.author.birthDate === 'string' ? formValues.author.birthDate : formValues.author.birthDate.format('YYYY-MM-DD');
    report.author.email = formValues.author.email;
    report.author.sex = formValues.author.sex;
    report.description = formValues.description;
    report.observations = formValues.observations;

    return report;
  }

  checkIfEmailAlreadyExist(email: string): boolean {
    let granted = false;

    if (email) {
      const report = this.allReports.find(report => report && report.author && report.author.email === email);
      granted = report ? false : true;
    }
    return granted;
  }

  private buildForm(): FormGroup {
    const authorGroup = this.formBuilder.group({
      firstName: ['', {
        validators: [Validators.required, Validators.max(50)],
        updateOn: 'blur'
      }],
      lastName: ['', {
        validators: [Validators.required, Validators.max(50)],
        updateOn: 'blur'
      }],
      birthDate: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      sex: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      email: ['', {
        validators: [Validators.required, Validators.email],
        updateOn: 'blur'
      }],
    });

    return this.formBuilder.group({
      index: [this.reportIndex],
      author: authorGroup,
      description: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      observations: this.formBuilder.array([], {
        validators: [Validators.required],
        updateOn: 'change'
      })
    });
  }

  private manageObservations(observations: Observation[] | undefined): void {
    if (!this.reportForm) {
      return;
    }

    const array = this.reportForm.get('observations') as FormArray;

    if (!array || !observations || observations.length <= 0) {
      return;
    }

    observations.forEach(observation => {
      const group = this.formBuilder.group({
        id: observation.id,
        name: observation.name
      });
      array.push(group);
    });
  }
}

