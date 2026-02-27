import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponant } from './sidebar-componant';

describe('SidebarComponant', () => {
  let component: SidebarComponant;
  let fixture: ComponentFixture<SidebarComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
