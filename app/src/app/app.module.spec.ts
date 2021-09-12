import {AppModule} from './app.module';

describe('AppModule', () => {
  it('should create', () => {
    expect(AppModule).toBeTruthy();
    expect(new AppModule()).toBeTruthy();
  });
});
