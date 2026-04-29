import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  standalone: true,
  template: '',
})
class DummyStatusComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([{ path: 'status', component: DummyStatusComponent }]),
        {
          provide: DataAccessService,
          useValue: {
            jobsResource: {
              value: () => [],
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the shell component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the jobs header on the root view', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Saved opportunities');
  });
});
