import 'jest-preset-angular/setup-jest';
import {
  TestBed,
  TestModuleMetadata,
  waitForAsync,
} from '@angular/core/testing';

global['__webpack_public_path__'] = '';

const resetTestingModule = TestBed.resetTestingModule;
const preventAngularFromResetting = () => TestBed.resetTestingModule = () => TestBed;

global['setupTestBed'] = (
  moduleDef: TestModuleMetadata, override = null, overrideWith = null) => {
  beforeAll(waitForAsync(async () => {
    resetTestingModule();
    preventAngularFromResetting();
    if (override) {
      TestBed.configureTestingModule(moduleDef).
        overrideModule(override, overrideWith);
    } else {
      TestBed.configureTestingModule(moduleDef);
    }
    await TestBed.compileComponents();
  }));

  afterAll(() => resetTestingModule());
};

const storageMock = () => {
  let storage = {};
  return {
    getItem: key => key in storage ? storage[key] : null,
    setItem: (key, value) => storage[key] = value || '',
    removeItem: key => delete storage[key],
    clear: () => storage = {},
  };
};

Object.defineProperty(window, 'localStorage', {value: storageMock()});
Object.defineProperty(window, 'sessionStorage', {value: storageMock()});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
});
Object.defineProperty(window, 'confirm', {
  value: () => {
    return true;
  },
});
Object.defineProperty(window, 'location', {
  value: {
    reload: () => {
    },
  },
});

/* Silences ngrx 8 warnings */
/* TODO Remove */
console.warn = () => {
};
