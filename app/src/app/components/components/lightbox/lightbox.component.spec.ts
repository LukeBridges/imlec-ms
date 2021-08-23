import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LightboxComponent} from './lightbox.component';
import {SafePipe} from '../../../core/pipe/safe.pipe';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

describe('LightboxComponent', () => {
  let component: LightboxComponent;
  let fixture: ComponentFixture<LightboxComponent>;

  setupTestBed({
    imports: [
      MatIconModule,
      MatDialogModule,
      MatButtonModule,
    ],
    declarations: [LightboxComponent, SafePipe],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LightboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
