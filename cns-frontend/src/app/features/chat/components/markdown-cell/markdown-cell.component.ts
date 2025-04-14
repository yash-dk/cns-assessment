import { Component, Input, Output, EventEmitter, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { Cell } from '../../models/cell.model';
import { NotebookService } from '../../services/notebook.service';

@Component({
  selector: 'app-markdown-cell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MonacoEditorModule
  ],
  templateUrl: './markdown-cell.component.html',
  styleUrls: ['./markdown-cell.component.scss']
})
export class MarkdownCellComponent {
  @Input() cell!: Cell;
  @Input() isExpanded = false;
  @Input() isEditing = false;

  @Output() update = new EventEmitter<Partial<Cell>>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleExpand = new EventEmitter<boolean>();
  @Output() toggleEdit = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Partial<Cell>>();

  private currentCode: string = '';
  isDirty = false;

  editorOptions = {
    theme: 'vs-dark',
    language: 'markdown',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on'
  };

  constructor(
    private notebookService: NotebookService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.currentCode = this.cell.code || '';
  }

  onUpdate(code: string): void {
    this.currentCode = code;
    this.isDirty = true;
  }

  onSave(): void {
    this.save.emit({ code: this.cell.code });
    this.isDirty = false;
  }

  onDelete(): void {
    this.delete.emit();
  }

  onToggleExpand(): void {
    this.toggleExpand.emit(!this.isExpanded);
  }

  onToggleEdit(): void {
    // Save changes when exiting edit mode
    if (this.isEditing && this.isDirty) {
      this.onSave();
    }
    this.toggleEdit.emit(!this.isEditing);
  }

  getRenderedMarkdown(): string {
    if (!this.cell.code) return '';
    const rawHtml = marked(this.cell.code);
    return this.sanitizer.sanitize(SecurityContext.HTML, rawHtml) || '';
  }
}