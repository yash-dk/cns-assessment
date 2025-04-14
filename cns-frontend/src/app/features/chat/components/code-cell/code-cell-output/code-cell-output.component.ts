import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-code-output',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-cell-output.component.html',
  styleUrls: ['./code-cell-output.component.scss']
})
export class CodeCellOutputComponent {
    @Input() textOutput: string = '';
    @Input() plotUrls: string[] = [];
  
    processedParts: { type: 'text' | 'img' | 'iframe'; value: string | SafeResourceUrl }[] = [];
  
    constructor(private sanitizer: DomSanitizer) {}
  
    ngOnChanges() {
      this.processedParts = [];
  
      const hookPattern = /<\[Hook\]-\[.*?\]>/g;
      const segments = this.textOutput.split(hookPattern);
      const matches = this.textOutput.match(hookPattern) || [];
  
      segments.forEach((segment, index) => {
        if (segment.trim()) {
          this.processedParts.push({ type: 'text', value: segment });
        }
  
        const rawUrl = this.plotUrls[index] ? `${environment.apiBaseUrl}${this.plotUrls[index]}` : null;
        if (rawUrl) {
          if (rawUrl.endsWith('.png')) {
            this.processedParts.push({ type: 'img', value: rawUrl });
          } else if (rawUrl.endsWith('.html')) {
            const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
            this.processedParts.push({ type: 'iframe', value: safeUrl });
          }
        }
      });
    }
  }
  