import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentaForm } from './venta-form';

describe('VentaForm', () => {
  let component: VentaForm;
  let fixture: ComponentFixture<VentaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VentaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
