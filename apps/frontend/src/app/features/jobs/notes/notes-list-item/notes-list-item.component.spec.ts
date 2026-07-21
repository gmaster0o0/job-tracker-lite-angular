import { Component } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { NotesListItemComponent } from './notes-list-item.component';
import { noteFixtures } from '@job-tracker-lite-angular/testing';
import { NotesListItemHarness } from './notes-list-item.harness';
import { getTranslocoModule } from '@job-tracker-lite-angular/frontend-shared';

@Component({
  standalone: true,
  imports: [NotesListItemComponent],
  template: ` <app-notes-list-item [note]="note" /> `,
})
class HostComponent {
  note = noteFixtures.janeDoe;
}
// TODO need to add more tests for this component, but for now, just testing that it renders correctly
describe('NotesListItemComponent', () => {
  let harness: NotesListItemHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, getTranslocoModule()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      NotesListItemHarness,
    );
  });

  it('should create', () => {
    expect(harness).toBeTruthy();
  });
});
