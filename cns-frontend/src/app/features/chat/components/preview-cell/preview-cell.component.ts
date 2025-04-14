import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-preview-cell',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './preview-cell.component.html',
  styleUrls: ['./preview-cell.component.scss']
})
export class PreviewCellComponent {
  @Input() content: string = '';
  @Input() isExpanded = false;

  @Output() toggleExpand = new EventEmitter<boolean>();

  onToggleExpand(): void {
    this.toggleExpand.emit(!this.isExpanded);
  }
}