import {NgModule} from '@angular/core';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {CommonModule} from '@angular/common';
import {MatRippleModule} from '@angular/material/core';
import {CdkTableModule} from '@angular/cdk/table';
import {MatExpansionModule} from '@angular/material/expansion';
import {DetailRowDirective} from './directives/detail-row.directive';

const MODULES = [
  MatTableModule,
  CommonModule,
  MatRippleModule,
  CdkTableModule,
  MatExpansionModule,
];

@NgModule({
  declarations: [DetailRowDirective],
  imports: MODULES,
  exports: [...MODULES, DetailRowDirective],
})
export class ScoreboardImportsModule {

}
