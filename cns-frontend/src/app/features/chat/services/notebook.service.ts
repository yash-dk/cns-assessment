import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Notebook, NotebookList, Cell } from '../models/cell.model';
import { environment } from '../../../../environments/environment';
import { tap, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotebookService {
  private notebooks: Notebook[] = [];
  private activeNotebookSubject = new BehaviorSubject<Notebook | null>(null);
  private apiBaseUrl = environment.apiBaseUrl;
  activeNotebook$ = this.activeNotebookSubject.asObservable();

  constructor(private http: HttpClient) { }

  getNotebooks(): Observable<NotebookList[]> {
    return this.http.get<NotebookList[]>(`${this.apiBaseUrl}/api/notebook`);
  }

  getNotebook(id: string): Observable<Notebook> {
    return this.http.get<Notebook>(`${this.apiBaseUrl}/api/notebook/${id}`).pipe(
      tap((notebook) => {
        this.activeNotebookSubject.next(notebook);
      })
    );
  }

  createNotebook(title: string, description: string): Observable<Notebook> {
    return this.http.post<Notebook>(`${this.apiBaseUrl}/api/notebook`, {
      title,
      description
    });
  }

  deleteNotebook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/notebook/${id}`);
  }

  addCell(notebookId: string, language: string, position?: number): Observable<Cell> {
    return this.http.post<Cell>(`${this.apiBaseUrl}/api/block`, {
      notebook_id: parseInt(notebookId),
      language,
      code: '',
      order: position || 0
    }).pipe(
      tap((cell) => {
        const notebook = this.activeNotebookSubject.value;
        if (notebook && notebook.id === notebookId) {
          notebook.cells.push(cell);
          notebook.updatedAt = new Date().toISOString();
          this.activeNotebookSubject.next({ ...notebook });
        }
      })
    );
  }

  updateCell(notebookId: string, cellId: string, updates: Partial<Cell>): Observable<Cell> {
    const notebook = this.activeNotebookSubject.value;

    if (!notebook) {
      throw new Error(`No active notebook found`);
    }

    const cell = notebook.cells.find(c => c.id === cellId);

    if (!cell) {
      throw new Error(`Cell with id ${cellId} not found in notebook`);
    }

    return this.http.put<Cell>(`${this.apiBaseUrl}/api/block/${cellId}`, {
      notebook_id: parseInt(notebookId),
      language: updates.language || cell.language,
      code: updates.code || cell.code,
      order: updates.order || cell.order,
      text_output: updates.text_output == undefined ? cell.text_output : updates.text_output,
      error: updates.error == undefined ? cell.error : updates.error,
      plot_urls: updates.plot_urls || cell.plot_urls
    }).pipe(
      tap((updatedCell) => {
        const cellIndex = notebook.cells.findIndex(c => c.id === cellId);
        if (cellIndex !== -1) {
          notebook.cells[cellIndex] = updatedCell;
          notebook.updatedAt = new Date().toISOString();
          this.activeNotebookSubject.next({ ...notebook });
        }
      })
    );
  }

  /**
   * Updates a cell locally without making an API call.
   * This is used for real-time updates as the user types.
   */
  updateCellLocally(notebookId: string, cellId: string, updates: Partial<Cell>): void {
    const notebook = this.activeNotebookSubject.value;

    if (!notebook) {
      throw new Error(`No active notebook found`);
    }

    const cellIndex = notebook.cells.findIndex(c => c.id === cellId);

    if (cellIndex === -1) {
      throw new Error(`Cell with id ${cellId} not found in notebook`);
    }

    // Update the cell in the local notebook state only
    notebook.cells[cellIndex] = {
      ...notebook.cells[cellIndex],
      ...updates
    };

    notebook.updatedAt = new Date().toISOString();
    this.activeNotebookSubject.next({ ...notebook });
  }

  deleteCell(notebookId: string, cellId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/block/${cellId}`);
  }

  executeCell(notebookId: string, cellId: string, code: string): Observable<Cell> {
    const notebook = this.activeNotebookSubject.value;

    if (!notebook) {
      throw new Error(`No active notebook found`);
    }

    const cell = notebook.cells.find(c => c.id === cellId);

    if (!cell) {
      throw new Error(`Cell with id ${cellId} not found in notebook`);
    }

    // Use the code that is currently in the cell (which might be different from what's saved on the server)
    // We don't need to save to the API first - we'll use what's in the local model
    return this.http.post<{ text_output?: string, error?: string, plot_urls?: string[] }>(`${this.apiBaseUrl}/api/code/execute`, {
      code: cell.code,
      language: cell.language
    }).pipe(
      switchMap((executionResult) => {
        // Only update the execution results in the cell, not the code which might've been changed locally
        return this.updateCell(notebookId, cellId, {
          text_output: executionResult.text_output || '',
          error: executionResult.error || '',
          plot_urls: executionResult.plot_urls || []
        });
      }),
      catchError((error) => {
        const errorMessage = error?.error?.detail || error?.message || 'Code execution failed';

        return this.updateCell(notebookId, cellId, {
          text_output: '',
          error: `Error: ${errorMessage}`
        });
      })
    );
  }

  getCellsByNotebook(notebookId: string): Observable<Cell[]> {
    return this.http.get<Cell[]>(`${this.apiBaseUrl}/api/block/notebook/${notebookId}`);
  }

  getCell(cellId: string): Observable<Cell> {
    return this.http.get<Cell>(`${this.apiBaseUrl}/api/block/${cellId}`);
  }
}