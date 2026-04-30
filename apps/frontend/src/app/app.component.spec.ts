import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { DataAccessService } from '@job-tracker-lite-angular/frontend-data-access';

@Component({
  standalone: true,
  template: 'Test Menu',
})
class DummyMenuComponent {}

@Component({
  standalone: true,
  template: 'Test Content',
})
class DummyContentComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          {
            path: '',
            component: DummyContentComponent,
            outlet: 'primary',
            children: [
              {
                path: 'jobs',
                component: DummyContentComponent,
              },
            ],
          },
          {
            path: '',
            component: DummyMenuComponent,
            outlet: 'sidenav',
          },
        ]),
        {
          provide: DataAccessService,
          useValue: {
            jobsResource: {
              value: () => [],
              isLoading: () => false,
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

  it('should render with router outlet', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});
