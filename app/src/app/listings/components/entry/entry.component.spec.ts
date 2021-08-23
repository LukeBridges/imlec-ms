import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EntryComponent} from './entry.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('ListingsComponent', () => {
  let component: EntryComponent;
  let fixture: ComponentFixture<EntryComponent>;

  setupTestBed({
    declarations: [EntryComponent, ContentBoxComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
