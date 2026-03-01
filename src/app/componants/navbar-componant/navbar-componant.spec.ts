import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NabbarComponant } from './navbar-componant';

describe('NabbarComponant', () => {
  let component: NabbarComponant;
  let fixture: ComponentFixture<NabbarComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NabbarComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NabbarComponant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
