import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesComponant } from './employees-componant';

describe('EmployeesComponant', () => {
  let component: EmployeesComponant;
  let fixture: ComponentFixture<EmployeesComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesComponant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
