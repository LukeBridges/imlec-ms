import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FoodRoutingModule} from './food-routing.module';
import {CoreModule} from '../core/core.module';
import {ComponentsModule} from '../components/components.module';
import {FoodComponent} from './containers/food/food.component';

@NgModule({
  declarations: [FoodComponent],
  imports: [
    CommonModule,
    FoodRoutingModule,
    CoreModule,
    ComponentsModule,
  ],
})
export class FoodModule {
}
