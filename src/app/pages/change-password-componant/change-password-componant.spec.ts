import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordComponant } from './change-password-componant';

describe('ChangePasswordComponant', () => {
  let component: ChangePasswordComponant;
  let fixture: ComponentFixture<ChangePasswordComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
