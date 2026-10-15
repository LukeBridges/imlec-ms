import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  DOCUMENT,
  ChangeDetectionStrategy
} from '@angular/core';
import {ScoreComponent} from '../score/score.component';
import {MatTableModule} from '@angular/material/table';
import {MatRippleModule} from '@angular/material/core';
import {DetailRowDirective} from '../../directives/detail-row.directive';
import {FlipNumberComponent} from '../flip-number/flip-number.component';

@Component({
    selector: 'app-score-mobile',
    templateUrl: '../score/score.component.html',
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatTableModule, MatRippleModule, DetailRowDirective, FlipNumberComponent]
})
export class ScoreMobileComponent extends ScoreComponent
  implements OnInit, OnDestroy {

  public desktop = false;

  displayedColumns: string[] = [
    'place',
    'loco',
    'driversName',
    'coalUsed',
    'overallThermalEfficiency',
  ];

  // istanbul ignore next
  constructor(
    @Inject(DOCUMENT) protected document: Document,
    @Inject(ChangeDetectorRef) public changeDetection: ChangeDetectorRef) {
    super(document, changeDetection);
  }

  // istanbul ignore next
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  // istanbul ignore next
  setScrolling() {
  }

  // istanbul ignore next
  async scrollTop() {
  }

  // istanbul ignore next
  async scrollBottom() {
  }
}
