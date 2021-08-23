import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RulesRoutingModule} from './rules-routing.module';
import {RulesComponent} from './containers/rules/rules.component';
import {CoreModule} from '../core/core.module';

@NgModule({
  declarations: [RulesComponent],
  imports: [
    CommonModule,
    RulesRoutingModule,
    CoreModule,
  ],
})
export class RulesModule {
}
