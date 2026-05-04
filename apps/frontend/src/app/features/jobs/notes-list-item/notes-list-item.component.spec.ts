import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotesListItemComponent } from './notes-list-item.component';

describe('NotesListItemComponent', () => {
  let component: NotesListItemComponent;
  let fixture: ComponentFixture<NotesListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesListItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
