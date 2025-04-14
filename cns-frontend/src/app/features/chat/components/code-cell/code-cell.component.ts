import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { Cell } from '../../models/cell.model';
import { NotebookService } from '../../services/notebook.service';
import { environment } from '../../../../../environments/environment';
import { CodeCellOutputComponent } from './code-cell-output/code-cell-output.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-code-cell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MonacoEditorModule,
    CodeCellOutputComponent,
    MatProgressSpinner
  ],
  templateUrl: './code-cell.component.html',
  styleUrls: ['./code-cell.component.scss']
})
export class CodeCellComponent implements OnInit {
  @Input() cell!: Cell;
  @Input() isExpanded = false;
  @Input() isExecuting = false;

  @Output() execute = new EventEmitter<string>();
  @Output() update = new EventEmitter<Partial<Cell>>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleExpand = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Partial<Cell>>();

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: false }
  };

  availableLanguages = ['python', 'r'];
  currentCode: string = '';
  currentLanguage: string = 'python';
  isDirty = false;
  showEditor = true;

  constructor(private notebookService: NotebookService) { }

  ngOnInit(): void {
    this.currentCode = this.cell.code || '';
    this.currentLanguage = this.cell.language || 'python';

    this.updateEditorLanguage();
  }

  onExecute(): void {
    if (this.isExecuting) return;
    this.execute.emit(this.cell.id);
  }

  onCodeChange(code: string): void {
    this.currentCode = code;
    this.isDirty = true;

    if (this.cell.notebook_id) {
      this.notebookService.updateCellLocally(
        this.cell.notebook_id.toString(),
        this.cell.id,
        { code: this.currentCode }
      );
    }
  }

  onLanguageChange(language: string): void {
    this.currentLanguage = language;
    this.isDirty = true;
    this.updateEditorLanguage();

    if (this.cell.notebook_id) {
      this.notebookService.updateCellLocally(
        this.cell.notebook_id.toString(),
        this.cell.id,
        { language: this.currentLanguage }
      );
    }
  }

  updateEditorLanguage(): void {
    const monacoLanguage = this.currentLanguage === 'r' ? 'r' : 'python';
    this.editorOptions = {
      ...this.editorOptions,
      language: monacoLanguage
    };
  }

  onSave(): void {
    this.save.emit({
      code: this.currentCode,
      language: this.currentLanguage
    });
    this.isDirty = false;
  }

  onDelete(): void {
    this.delete.emit();
  }

  onToggleExpand(): void {
    this.toggleExpand.emit(!this.isExpanded);
  }

  toggleEditor(): void {
    this.showEditor = !this.showEditor;
  }

  getProcessedOutput(textOutput: string, plotUrls?: string[]): string {
    if (!plotUrls?.length) return this.escapeHtml(textOutput);

    let escapedText = this.escapeHtml(textOutput);

    // Replace each <[Hook]-[UUID]> with corresponding plot embed
    const hookPattern = /&lt;\[Hook\]-\[.*?\]&gt;/g;

    let i = 0;
    escapedText = escapedText.replace(hookPattern, () => {
      const url = `${environment.apiBaseUrl}${plotUrls[i++]}`;
      if (url.endsWith('.png')) {
        return `<img src="${url}" alt="Plot" style="max-width:100%;">`;
      } else if (url.endsWith('.html')) {
        return `<iframe src="${url}" width="100%" height="400" frameborder="0"></iframe>`;
      } else {
        return `<a href="${url}" target="_blank">${url}</a>`;
      }
    });

    return escapedText;
  }


  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

}