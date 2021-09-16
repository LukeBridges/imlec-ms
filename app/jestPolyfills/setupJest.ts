import 'jest-preset-angular/setup-jest';
import {TestBed, TestModuleMetadata, waitForAsync} from '@angular/core/testing';

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
