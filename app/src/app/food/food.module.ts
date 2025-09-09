import {NgModule} from '@angular/core';
import {FoodRoutingModule} from './food-routing.module';
import {CoreModule} from '../core/core.module';
import {FoodComponent} from './containers/food/food.component';
import {ContentBoxComponent} from "../components/components/contentBox/contentBox.component";

@NgModule({
  declarations: [FoodComponent],
  imports: [
    FoodRoutingModule,
    CoreModule,
    ContentBoxComponent
  ],
})
export class FoodModule {
}
