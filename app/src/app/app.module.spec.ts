import {AppModule} from './app.module';

describe('AppModule', () => {
  test('should create', () => {
    expect(AppModule).toBeTruthy();
    expect(new AppModule()).toBeTruthy();
  });
});
