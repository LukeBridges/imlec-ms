import {
  ChangeDetectorRef,
  Component,
  Inject,
  NgModule,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {ScoreComponent} from '../score/score.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DOCUMENT} from '@angular/common';
import {ScoreboardImportsModule} from '../../scoreboard-imports.module';

@Component({
  selector: 'app-score-mobile',
  templateUrl: '../score/score.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('detailExpand', [
      state('void',
        style({height: '0px', minHeight: '0', visibility: 'hidden'})),
      state('*', style({height: '*', visibility: 'visible'})),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
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
