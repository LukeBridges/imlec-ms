import {DetailRowDirective} from './detail-row.directive';
import {ElementRef, EmbeddedViewRef, TemplateRef, ViewContainerRef} from '@angular/core';

describe('DetailRowDirective', () => {
  let directive: DetailRowDirective;
  const vcRef: ViewContainerRef = <ViewContainerRef>{
    clear() {
    },
    createEmbeddedView<C>(
      templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C> {
      return null;
    },
    length: 0,
  };

  beforeEach(() => {
    directive = new DetailRowDirective(vcRef);
  });

  test('should create', () => {
    expect(DetailRowDirective).toBeTruthy();
  });

  describe('get expanded', () => {
    test('should return value of opened', () => {
      directive['opened'] = true;

      expect(directive.expended).toBeTruthy();

      directive['opened'] = false;

      expect(directive.expended).toBeFalsy();
    });
  });

  describe('cdkDetailRow', () => {
    test('should update row value', () => {
      const newValue = 'newValue';
      directive['row'] = null;

      directive.cdkDetailRow = newValue;

      expect(directive['row']).toEqual(newValue);

      directive.cdkDetailRow = newValue;

      expect(directive['row']).toEqual(newValue);
    });
  });

  describe('template', () => {
    test('should update template value', () => {
      const newValue: TemplateRef<any> = {
        get elementRef(): ElementRef {
          return null;
        },
        createEmbeddedView(context: any): EmbeddedViewRef<any> {
          return null;
        },
      };
      directive['tRef'] = null;

      directive.template = newValue;

      expect(directive['tRef']).toEqual(newValue);

      directive.template = newValue;

      expect(directive['tRef']).toEqual(newValue);
    });
  });

  describe('onClick', () => {
    test('should call toggle', () => {
      vitest.spyOn(directive, 'toggle').mockImplementation();

      directive.onClick();

      expect(directive.toggle).toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    test('should call clear if opened', () => {
      directive['opened'] = true;

      vitest.spyOn(directive.vcRef, 'clear').mockImplementation();
      vitest.spyOn(directive, 'render').mockImplementation();

      directive.toggle();

      expect(directive.vcRef.clear).toHaveBeenCalled();
      expect(directive.render).not.toHaveBeenCalled();
      expect(directive['opened']).toBeFalsy();
    });

    test('should call render if not opened', () => {
      directive['opened'] = false;

      vitest.spyOn(directive.vcRef, 'clear').mockImplementation();
      vitest.spyOn(directive, 'render').mockImplementation();

      directive.toggle();

      expect(directive.render).toHaveBeenCalled();
      expect(directive['opened']).toBeFalsy();
    });
  });

  describe('render', () => {
    test('should clear and createView', () => {
      vitest.spyOn(directive.vcRef, 'clear').mockImplementation();
      vitest.spyOn(directive.vcRef, 'createEmbeddedView').mockImplementation();

      directive.template = {
        get elementRef(): ElementRef {
          return null;
        },
        createEmbeddedView(context: any): EmbeddedViewRef<any> {
          return null;
        },
      };
      directive.cdkDetailRow = 'test';

      directive.render();

      expect(directive.vcRef.clear).toHaveBeenCalled();
      expect(directive.vcRef.createEmbeddedView).toHaveBeenCalled();
    });
  });
});
