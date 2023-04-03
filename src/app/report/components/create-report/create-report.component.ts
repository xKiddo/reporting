import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observation } from 'src/app/core/interfaces/observation';
import { ObservationsService } from 'src/app/core/services/observations.service';
import * as _moment from 'moment';
import { ReportService } from 'src/app/core/services/report.service';
import { Animations } from 'src/app/core/consts/animations.const';
import { Report } from 'src/app/core/interfaces/report';
const moment = _moment;

@Component({
  selector: 'app-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.scss'],
  animations: [Animations.opacify]
})
export class CreateReportComponent implements OnInit {

  observations: Observation[] | undefined;
  addedObservations: Observation[] = [];
  filteredObservations: Observation[] | undefined;
  formLoading = false;
  formSuccess = false;
  formError = false;
  formEmailError = false;
  minDate = moment().subtract(100, 'years');
  maxDate = moment();

  get reportForm(): FormGroup | undefined {
    return this.reportService.reportForm ? this.reportService.reportForm : undefined;
  }

  get authorFormGroup(): FormGroup | undefined {
    return this.reportForm ? this.reportForm.get('author') as FormGroup : undefined;
  }

  get firstNameControl(): FormControl | undefined {
    return this.authorFormGroup ? this.authorFormGroup.get('firstName') as FormControl : undefined;
  }

  get lastNameControl(): FormControl | undefined {
    return this.authorFormGroup ? this.authorFormGroup.get('lastName') as FormControl : undefined;
  }

  get birthDateControl(): FormControl | undefined {
    return this.authorFormGroup ? this.authorFormGroup.get('birthDate') as FormControl : undefined;
  }

  get sexControl(): FormControl | undefined {
    return this.authorFormGroup ? this.authorFormGroup.get('sex') as FormControl : undefined;
  }

  get emailControl(): FormControl | undefined {
    return this.authorFormGroup ? this.authorFormGroup.get('email') as FormControl : undefined;
  }

  get descriptionControl(): FormControl | undefined {
    return this.reportForm ? this.reportForm.get('description') as FormControl : undefined;
  }

  get observationsArray(): FormArray | undefined {
    return this.reportForm ? this.reportForm.get('observations') as FormArray : undefined;
  }

  get formEditMode(): boolean {
    return this.reportService.isFormEditMode;
  }

  @ViewChild('observationInput') observationInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('form') form: FormGroupDirective | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private observationService: ObservationsService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.initObservations();
    this.initObservationsChanges();
  }

  selectObservation(event: MatAutocompleteSelectedEvent): void {
    if (!event || !event.option || !event.option.value || !this.observationsArray) {
      return;
    }

    const observation = event.option.value as Observation;

    this.addedObservations.push(observation);
    this.observationsArray.push(this.formBuilder.group(observation));
    this.addOrRemoveObservation(false, observation);
    if (this.observationInput) {
      this.observationInput.nativeElement.value = '';
    }
  }

  removeObservation(obs: Observation): void {
    if (!obs || !this.addedObservations || this.addedObservations.length <= 0 || !this.observationsArray) {
      return;
    }

    this.addedObservations = this.addedObservations
      .filter(observation => observation && observation.name && obs && obs.name && observation.name !== obs.name);

      const index = this.observationsArray.value
      .findIndex((group: any) => group && group.id !== undefined && obs && obs.id !== undefined && group.id === obs.id);

    if (index !== undefined) {
      this.observationsArray.removeAt(index);
    }
    this.addOrRemoveObservation(true, obs);
  }

  filterObservations(event: Event): Observation[] | undefined {
    if (!this.observations || this.observations.length <= 0) {
      return;
    }

    const inputEvent = event as InputEvent;
    const input = this.observationInput ? this.observationInput.nativeElement : undefined;

    if (input && input.value && inputEvent.data) {
      this.filteredObservations = this.observations.filter(observation => {

        let accepted = false;

        if (observation && observation.name && input.value) {
          accepted = observation.name.toLowerCase().includes(input.value) && !this.addedObservations.includes(observation);
        }
        return accepted;
      });
    } else {
      this.filteredObservations = this.observations.filter(observation => observation && !this.addedObservations.includes(observation));
    }
    return this.filteredObservations;
  }

  onSubmitReportForm(): void {
    this.formError = false;
    this.formEmailError = false;
    if (this.reportForm && this.reportForm.valid) {
      const granted = this.reportService.checkIfEmailAlreadyExist(this.emailControl?.value);

      if (!granted && !this.formEditMode) {
        this.formEmailError = true;
        return;
      }

      const request = this.reportService.buildObjectRequest();

      if (request) {
        this.formLoading = true;
        setTimeout(() => {
          this.formEditMode ? this.onSubmitEditMode(request) : this.onSubmitAddMode(request);
        }, 1000);
      }
    }
  }

  cancelReport(): void {
    if (this.formEditMode) {
      this.reportService.isFormEditMode = false;
      const currentReport = this.reportService.allReports.find(report => report && report.edit);
      if (currentReport) {
        currentReport.edit = false;
      }
      this.resetForm();
    }
  }

  private onSubmitEditMode(request: Report): void {
    this.reportService.updateReport(request).subscribe({
      next: () => this.continueProccess(),
      error: () => {
        this.formLoading = false;
        this.formError = true;
      }
    });
  }

  private onSubmitAddMode(request: Report): void {
    this.reportService.postReport(request).subscribe({
      next: () => this.continueProccess(),
      error: () => {
        this.formLoading = false;
        this.formError = true;
      }
    });
  }

  private continueProccess(): void {
    this.formLoading = false;
    this.formSuccess = true;
    this.resetForm();
    setTimeout(() => {
      const card = document.getElementsByTagName('mat-card').item(0);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest'});
      }
    });
    setTimeout(() => {
      this.formSuccess = false;
      if (this.formEditMode) {
        this.reportService.isFormEditMode = false;
      }
    }, 3000);
  }

  private initObservations(): void {
    this.observationService.getObservations().subscribe((response: Observation[] | undefined) => {
      if (response && response.length > 0) {
        this.observations = response;
        this.filteredObservations = this.observations;
      }
    });
  }

  private initObservationsChanges(): void {
    if (!this.observationsArray) {
      return;
    }

    this.observationsArray.valueChanges.subscribe({
      next: (observations: Observation[]) => {
        if (this.formEditMode && this.observations && this.observations.length > 0 && this.addedObservations) {
          observations.forEach(observation => {
            const present = this.addedObservations.find(obs => obs && obs.id === observation.id) ? true : false;
            if (!present) {
              this.addedObservations.push(observation);
              this.addOrRemoveObservation(false, observation);
            }
          });
        }
      }
    });
  }

  private addOrRemoveObservation(add: boolean, obs: Observation): void {
    if (!this.filteredObservations || this.filteredObservations.length <= 0 || !obs) {
      return;
    }

    if (add) {
      const index = obs.id - 1;
      this.filteredObservations.splice(index, 0, obs);
    } else {
      this.filteredObservations = this.filteredObservations
        .filter(observation => observation && observation.name && obs && obs.name && observation.name !== obs.name);
    }
  }

  private resetForm(): void {
    if (this.form) {
      this.form.resetForm();
    }
    if (this.observationsArray) {
      this.observationsArray.clear();
    }
    this.addedObservations = [];
    this.filteredObservations = this.observations;
  }
}
