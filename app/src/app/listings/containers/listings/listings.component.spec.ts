import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ListingsComponent} from './listings.component';
import {EntryComponent} from '../../components/entry/entry.component';
import {RouterTestingModule} from '@angular/router/testing';
import {StoreModule} from '@ngrx/store';
import * as fromEntries from '../../reducers/entries.reducer';
import {CountComponent} from '../../components/count/count.component';
import {SpinnerComponent} from '../../../components/components/spinner/spinner.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';

describe('ListingsComponent', () => {
  let component: ListingsComponent;
  let fixture: ComponentFixture<ListingsComponent>;

  setupTestBed({
    imports: [
      RouterTestingModule,
      StoreModule.forRoot({scores: fromEntries.reducer}),
    ],
    declarations: [
      ListingsComponent,
      EntryComponent,
      CountComponent,
      SpinnerComponent,
      ContentBoxComponent,
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
