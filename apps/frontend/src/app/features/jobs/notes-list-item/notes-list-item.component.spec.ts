import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotesListItemComponent } from './notes-list-item.component';
import { noteFixtures } from '@job-tracker-lite-angular/testing';

@Component({
  standalone: true,
  imports: [NotesListItemComponent],
  template: ` <app-notes-list-item [note]="note" /> `,
})
class HostComponent {
  note = noteFixtures.janeDoe;
}

describe('NotesListItemComponent', () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
