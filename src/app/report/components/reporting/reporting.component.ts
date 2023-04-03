import { Component, OnInit } from '@angular/core';
import { Animations } from 'src/app/core/consts/animations.const';
import { Report } from 'src/app/core/interfaces/report';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss'],
  animations: [Animations.fadeIn]
})
export class ReportingComponent implements OnInit {

  get reports(): Report[] | undefined {
    return this.reportService.allReports;
  }

  constructor(
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.reportService.getReport().subscribe();
  }
}
