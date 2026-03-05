import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogsComponant } from './blogs-componant';

describe('BlogsComponant', () => {
  let component: BlogsComponant;
  let fixture: ComponentFixture<BlogsComponant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogsComponant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogsComponant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
