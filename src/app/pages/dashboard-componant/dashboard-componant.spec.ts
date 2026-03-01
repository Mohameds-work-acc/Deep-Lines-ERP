import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponant } from './dashboard-componant';

describe('DashboardComponant', () => {
  let component: DashboardComponant;
  let fixture: ComponentFixture<DashboardComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
