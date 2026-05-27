import { Component } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { NotesListItemComponent } from './notes-list-item.component';
import { noteFixtures } from '@job-tracker-lite-angular/testing';
import { NotesListItemHarness } from './notes-list-item.harness';

@Component({
  standalone: true,
  imports: [NotesListItemComponent],
  template: ` <app-notes-list-item [note]="note" /> `,
})
class HostComponent {
  note = noteFixtures.janeDoe;
}

describe('NotesListItemComponent', () => {
  let harness: NotesListItemHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
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
