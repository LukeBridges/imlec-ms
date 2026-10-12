import {
  ChangeDetectorRef,
  Component,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  DOCUMENT,
  ChangeDetectionStrategy
} from '@angular/core';
import {ScoreComponent} from '../score/score.component';

import {ScoreboardImportsModule} from '../../scoreboard-imports.module';

@Component({
    selector: 'app-score-mobile',
    templateUrl: '../score/score.component.html',
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
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

@NgModule({
  declarations: [ScoreMobileComponent],
  imports: [ScoreboardImportsModule],
})
export class ScoreMobileComponentModule {
}
