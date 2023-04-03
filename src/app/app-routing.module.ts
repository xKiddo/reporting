import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportingComponent } from './report/components/reporting/reporting.component';

const routes: Routes = [
  {
    path: '',
    title: 'Reports - Create report',
    component: ReportingComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
