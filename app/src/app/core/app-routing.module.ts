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
        loadComponent: () => import('./../rules/containers/rules/rules.component').then(
          m => m.RulesComponent),
      },
      {
        path: 'hotels',
        loadComponent: () => import('./../hotels/containers/hotels/hotels.component').then(
          m => m.HotelsComponent),
      },
      {
        path: 'food',
        loadComponent: () => import('./../food/containers/food/food.component').then(
          m => m.FoodComponent),
      },
      {
        path: 'welcome',
        loadComponent: () => import('./../welcome/containers/welcome/welcome.component').then(
          m => m.WelcomeComponent),
      },
      {
        path: 'about',
        loadComponent: () => import('./../about/containers/about/about.component').then(
          m => m.AboutComponent),
      },
      {
        path: '',
        loadComponent: () => import('./../welcome/containers/welcome/welcome.component').then(
          m => m.WelcomeComponent),
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
