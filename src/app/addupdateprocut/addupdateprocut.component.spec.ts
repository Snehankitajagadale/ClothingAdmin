import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddupdateprocutComponent } from './addupdateprocut.component';

describe('AddupdateprocutComponent', () => {
  let component: AddupdateprocutComponent;
  let fixture: ComponentFixture<AddupdateprocutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddupdateprocutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddupdateprocutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
