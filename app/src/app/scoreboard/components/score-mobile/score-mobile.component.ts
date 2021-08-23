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
import {ScoreboardImportsModule} from '../../scoreboardImports.module';

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

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    @Inject(ChangeDetectorRef) public changeDetection: ChangeDetectorRef) {
    super(document, changeDetection);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  setScrolling() {
  }

  async scrollTop() {
  }

  async scrollBottom() {
  }
}

@NgModule({
  declarations: [ScoreMobileComponent],
  imports: [ScoreboardImportsModule],
})
export class ScoreMobileComponentModule {
}
