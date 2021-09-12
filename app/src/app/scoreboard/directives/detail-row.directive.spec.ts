import {DetailRowDirective} from './detail-row.directive';
import {ElementRef, EmbeddedViewRef, TemplateRef, ViewContainerRef} from '@angular/core';

describe('DetailRowDirective', () => {
  7;
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

  it('should create', () => {
    expect(DetailRowDirective).toBeTruthy();
  });

  describe('get expanded', () => {
    it('should return value of opened', () => {
      directive['opened'] = true;

      expect(directive.expended).toBeTruthy();

      directive['opened'] = false;

      expect(directive.expended).toBeFalsy();
    });
  });

  describe('cdkDetailRow', () => {
    it('should update row value', () => {
      const newValue = 'newValue';
      directive['row'] = null;

      directive.cdkDetailRow = newValue;

      expect(directive['row']).toEqual(newValue);

      directive.cdkDetailRow = newValue;

      expect(directive['row']).toEqual(newValue);
    });
  });

  describe('template', () => {
    it('should update template value', () => {
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
    it('should call toggle', () => {
      spyOn(directive, 'toggle').and.stub();

      directive.onClick();

      expect(directive.toggle).toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    it('should call clear if opened', () => {
      directive['opened'] = true;

      spyOn(directive.vcRef, 'clear').and.stub();
      spyOn(directive, 'render').and.stub();

      directive.toggle();

      expect(directive.vcRef.clear).toHaveBeenCalled();
      expect(directive.render).not.toHaveBeenCalled();
      expect(directive['opened']).toBeFalsy();
    });

    it('should call render if not opened', () => {
      directive['opened'] = false;

      spyOn(directive.vcRef, 'clear').and.stub();
      spyOn(directive, 'render').and.stub();

      directive.toggle();

      expect(directive.vcRef.clear).not.toHaveBeenCalled();
      expect(directive.render).toHaveBeenCalled();
      expect(directive['opened']).toBeFalsy();
    });
  });

  describe('render', () => {
    it('should clear and createView', () => {
      spyOn(directive.vcRef, 'clear').and.stub();
      spyOn(directive.vcRef, 'createEmbeddedView').and.stub();

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
