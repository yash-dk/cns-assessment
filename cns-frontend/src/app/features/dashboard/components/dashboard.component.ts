import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { CodeCellComponent } from '../../chat/components/code-cell/code-cell.component';
import { MarkdownCellComponent } from '../../chat/components/markdown-cell/markdown-cell.component';
import { PreviewCellComponent } from '../../chat/components/preview-cell/preview-cell.component';
import { NotebookService } from '../../chat/services/notebook.service';
import { CreateNotebookDialogComponent } from './create-notebook-dialog/create-notebook-dialog.component';
import { Notebook, Cell } from '../../chat/models/cell.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    CodeCellComponent,
    MarkdownCellComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activeNotebook: Notebook | null = null;
  expandedCellId: string | null = null;
  editingCellId: string | null = null;
  executingCellIds: string[] = [];

  constructor(
    private notebookService: NotebookService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.notebookService.activeNotebook$.subscribe(notebook => {
      this.activeNotebook = notebook;
      this.editingCellId = null;
    });
  }

  onNotebookSelected(notebookId: string): void {
    this.notebookService.getNotebook(notebookId).subscribe({
      error: (error) => {
        console.error('Failed to load notebook', error);
      }
    });
  }

  onCreateNotebook(): void {
    const dialogRef = this.dialog.open(CreateNotebookDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notebookService.createNotebook(result.name, result.description).subscribe({
          next: (notebook) => {
            this.notebookService.getNotebook(notebook.id).subscribe();
          },
          error: (error) => {
            console.error('Failed to create notebook', error);
          }
        });
      }
    });
  }

  onAddCell(type: 'code' | 'markdown'): void {
    if (this.activeNotebook) {
      // Set default language to 'python' for code cells or 'markdown' for markdown cells
      const language = type === 'code' ? 'python' : 'markdown';

      this.notebookService.addCell(this.activeNotebook.id, language).subscribe({
        next: (cell) => {
          if (type === 'markdown') {
            this.editingCellId = cell.id;
          }
        },
        error: (error) => {
          console.error('Failed to add cell', error);
        }
      });
    }
  }

  onExecuteCell(cellId: string): void {
    if (this.activeNotebook) {
      this.executingCellIds.push(cellId);
      const cell = this.activeNotebook.cells.find(c => c.id === cellId);
      if (cell) {
        this.notebookService.executeCell(this.activeNotebook.id, cellId, cell.code).subscribe({
          error: (error) => {
            console.error('Failed to execute cell', error);
          },
          complete: () => {
            this.executingCellIds = this.executingCellIds.filter(id => id !== cellId);

          }
        });
      }
    }
  }

  onSaveCell(cellId: string, updates: Partial<Cell>): void {
    if (this.activeNotebook) {
      this.notebookService.updateCell(this.activeNotebook.id, cellId, updates).subscribe({
        next: () => {
          console.log('Cell saved successfully');
        },
        error: (error) => {
          console.error('Failed to save cell', error);
        }
      });
    }
  }

  onDeleteCell(cellId: string): void {
    if (this.activeNotebook) {
      if (this.expandedCellId === cellId) {
        this.expandedCellId = null;
      }
      if (this.editingCellId === cellId) {
        this.editingCellId = null;
      }

      this.notebookService.deleteCell(this.activeNotebook.id, cellId).subscribe({
        error: (error) => {
          console.error('Failed to delete cell', error);
        }
      });
    }
  }

  onToggleCellExpand(cellId: string, isExpanded: boolean): void {
    this.expandedCellId = isExpanded ? cellId : null;
  }

  onToggleMarkdownEdit(cellId: string, isEditing: boolean): void {
    this.editingCellId = isEditing ? cellId : null;
  }
}