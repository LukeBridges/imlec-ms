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

  TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      StoreModule.forRoot({scores: fromEntries.reducer}),
      ContentBoxComponent,
      SpinnerComponent,
    ],
    declarations: [
      ListingsComponent,
      EntryComponent,
      CountComponent,
    ],
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
