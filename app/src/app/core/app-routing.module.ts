import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './containers/main/main.component';

// istanbul ignore next
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'scores',
        loadChildren: () => import('./../scoreboard/scoreboard.module').then(
          m => m.ScoreboardModule),
      },
      {
        path: 'listings',
        loadChildren: () => import('./../listings/listings.module').then(
          m => m.ListingsModule),
      },
      {
        path: 'rules',
        loadChildren: () => import('./../rules/rules.module').then(
          m => m.RulesModule),
      },
      {
        path: 'hotels',
        loadChildren: () => import('./../hotels/hotels.module').then(
          m => m.HotelsModule),
      },
      {
        path: 'food',
        loadChildren: () => import('./../food/food.module').then(
          m => m.FoodModule),
      },
      {
        path: 'winners',
        loadChildren: () => import('./../winners/winners.module').then(
          m => m.WinnersModule),
      },
      {
        path: 'welcome',
        loadChildren: () => import('./../welcome/welcome.module').then(
          m => m.WelcomeModule),
      },
      {
        path: 'about',
        loadChildren: () => import('./../about/about.module').then(
          m => m.AboutModule),
      },
      {
        path: '',
        loadChildren: () => import('./../welcome/welcome.module').then(
          m => m.WelcomeModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
