import {NgModule} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatRippleModule} from '@angular/material/core';
import {CdkTableModule} from '@angular/cdk/table';
import {MatExpansionModule} from '@angular/material/expansion';
import {DetailRowDirective} from './directives/detail-row.directive';

const MODULES = [
  MatTableModule,
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
