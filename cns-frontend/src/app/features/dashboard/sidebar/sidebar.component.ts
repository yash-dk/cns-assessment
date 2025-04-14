import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { NotebookService } from '../../chat/services/notebook.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { NotebookList } from '../../chat/models/cell.model';
import { User } from '../../../core/auth/models/auth.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  notebooks: NotebookList[] = [];
  currentUser: User | null = null;
  activeNotebookId: string | null = null;

  @Output() notebookSelected = new EventEmitter<string>();
  @Output() createNotebook = new EventEmitter<void>();

  constructor(
    private notebookService: NotebookService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadNotebooks();
    this.getCurrentUser();

    this.notebookService.activeNotebook$.subscribe(notebook => {
      if (notebook) {
        this.activeNotebookId = notebook.id;
      } else {
        this.activeNotebookId = null;
      }
    });

    this.notebookService.notebooksChanged$.subscribe(() => {
      this.loadNotebooks();
    });
  }

  loadNotebooks(): void {
    this.notebookService.getNotebooks().subscribe({
      next: (notebooks) => {
        this.notebooks = notebooks;
      },
      error: (error) => {
        console.error('Failed to load notebooks', error);
      }
    });
  }

  getCurrentUser(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
  }

  onNotebookClick(notebookId: string): void {
    this.notebookSelected.emit(notebookId);
  }

  onCreateNotebook(): void {
    this.createNotebook.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}