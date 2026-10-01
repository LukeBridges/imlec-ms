import {EntryComponent} from './entry.component';
import {ContentBoxComponent} from '../../../components/components/contentBox/contentBox.component';
import {LocoModel} from '../../../core/models/loco.model';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {environment} from '../../../../environments/environment';

describe('ListingsComponent', () => {
  let component: EntryComponent;
  let fixture: ComponentFixture<EntryComponent>;

  let entries: LocoModel[] = [];


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentBoxComponent],
      declarations: [EntryComponent],
    });
    fixture = TestBed.createComponent(EntryComponent);
    component = fixture.componentInstance;
    component.entries = entries;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    test('should split entries by day', () => {
      component.entries = Array.from({length: 30}, (_, i) => new LocoModel({runNo: i + 1}));

      component.ngOnChanges();

      expect(component.fridayEntries.length).toEqual(8);
      expect(component.saturdayEntries.length).toEqual(11);
      expect(component.sundayEntries.length).toEqual(8);
      expect(component.reserveEntries.length).toEqual(3);
      expect(component.hasReserves).toBe(true);
    });

    test('should have no reserves for small list', () => {
      component.entries = [new LocoModel({runNo: 1})];

      component.ngOnChanges();

      expect(component.hasReserves).toBe(false);
    });
  });

  describe('parseTime', () => {
    test('should pad short times', () => {
      expect(component.parseTime('930')).toEqual('09:30');
    });

    test('should format four digit times', () => {
      expect(component.parseTime('1015')).toEqual('10:15');
    });
  });

  test('should expose environment url', () => {
    expect(component.url).toEqual(environment.url);
  });
});
