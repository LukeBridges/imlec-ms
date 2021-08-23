import {getTestBed, TestBed} from '@angular/core/testing';
import * as WindowService from './window.service';

describe('window service', () => {
  let injector: TestBed;
  let windowRef: WindowService.WindowRef;
  let browserRef: WindowService.BrowserWindowRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        WindowService.WindowRef,
        WindowService.BrowserWindowRef,
      ],
    });
    injector = getTestBed();
    windowRef = injector.inject(WindowService.WindowRef);
    browserRef = injector.inject(WindowService.BrowserWindowRef);
  });

  it('should be created', () => {
    expect(browserRef).toBeTruthy();
    expect(windowRef).toBeTruthy();
  });

  it('windowref nativewindow should not not implemented exception', () => {
    expect(function() {
      return windowRef.nativeWindow;
    }).toThrowError('Not implemented.');
  });

  it('window factory should return new object with non browser platform id',
    () => {
      const factoryReturn = WindowService.windowFactory(browserRef, {});

      expect(factoryReturn).toEqual({});
    });
});
