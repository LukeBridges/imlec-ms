import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LightboxComponent, LightBoxData} from './lightbox.component';
import {SafePipe} from '../../pipe/safe.pipe';
import {MatIconModule} from '@angular/material/icon';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

describe('LightboxComponent', () => {
  let component: LightboxComponent;
  let fixture: ComponentFixture<LightboxComponent>;
  let lightBoxData: LightBoxData = {title: 'Test Lightbox'};

  TestBed.configureTestingModule({
    imports: [
      MatIconModule,
      MatDialogModule,
      MatButtonModule,
    ],
    declarations: [LightboxComponent, SafePipe],
    providers: [{provide: MAT_DIALOG_DATA, useValue: lightBoxData}],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LightboxComponent);
    TestBed.inject(MAT_DIALOG_DATA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
