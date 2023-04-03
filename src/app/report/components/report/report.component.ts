import { Component, Input } from '@angular/core';
import { Report } from 'src/app/core/interfaces/report';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {

  @Input() report: Report | undefined;

  constructor(
    private reportService: ReportService
  ) {}

  deleteReport(id: number | undefined): void {
    if (id !== undefined) {
      this.reportService.deleteReport(id).subscribe();
    }
  }

  editReport(report: Report | undefined): void {
    if (!report) {
      return;
    }

    const currentReport = this.reportService.allReports.find(report => report && report.edit);
    if (currentReport) {
      currentReport.edit = false;
    }

    report.edit = true;

    this.reportService.editReport(report);
  }
}
