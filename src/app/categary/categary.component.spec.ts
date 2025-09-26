import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategaryComponent } from './categary.component';

describe('CategaryComponent', () => {
  let component: CategaryComponent;
  let fixture: ComponentFixture<CategaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
