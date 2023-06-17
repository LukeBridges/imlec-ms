import {EntryComponent} from './entry.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';
import {LocoModel} from '../../../core/models/loco.model';
import {ComponentFixture, TestBed} from '@angular/core/testing';

describe('ListingsComponent', () => {
  let component: EntryComponent;
  let fixture: ComponentFixture<EntryComponent>;

  let entries: LocoModel[] = [];

  setupTestBed({
    imports: [ContentBoxComponent],
    declarations: [EntryComponent],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryComponent);
    component = fixture.componentInstance;
    component.entries = entries;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
