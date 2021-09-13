import {WelcomeComponent} from './welcome.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ScoresService} from '../../../scoreboard/services/scores.service';
import {ScoresServiceMock} from '../../../../test/mock/services/scores.service.mock';
import {WINDOW_PROVIDERS} from '../../../core/services/window.service';
import {ComponentsModule} from '../../../components/components.module';
import {WelcomeRoutingModule} from '../../welcome-routing.module';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {CoreModule} from '../../../core/core.module';
import {AppModule} from '../../../app.module';
import {CommonModule} from '@angular/common';
import {take} from 'rxjs/operators';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  setupTestBed({
    imports: [
      AppModule,
      CommonModule,
      CoreModule,
      WelcomeRoutingModule,
      MatButtonModule,
      MatDialogModule,
      ComponentsModule,
    ],
    declarations: [
      WelcomeComponent,
    ],
    providers: [
      {provide: ScoresService, useClass: ScoresServiceMock},
      WINDOW_PROVIDERS,
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create', () => {
    expect(WelcomeComponent).toBeTruthy();
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe', (done) => {
      component['ngUnsubscribe$'].pipe(take(1)).subscribe(() => {
        done();
      });

      component.ngOnDestroy();
    });
  });

  describe('openGMap', () => {
    it('should call dialog open', () => {
      spyOn(component.dialog, 'open').and.stub();

      component.openGMap();

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });

  describe('openMap', () => {
    it('should call dialog open', () => {
      spyOn(component.dialog, 'open').and.stub();

      component.openMap();

      expect(component.dialog.open).toHaveBeenCalled();
    });
  });
});
