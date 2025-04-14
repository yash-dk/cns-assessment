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

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges() {
    this.processedParts = [];

    const hookPattern = /<\[Hook\]-\[(.*?)\]>/g;
    const matches = [...this.textOutput.matchAll(hookPattern)];

    let lastIndex = 0;

    matches.forEach((match) => {
      const hookStart = match.index!;
      const hookEnd = hookStart + match[0].length;
      const hookId = match[1]; // get the UUID
      const url = this.plotUrls.find(p => p.includes(hookId));
      const fullUrl = url ? `${environment.apiBaseUrl}${url}` : null;

      const precedingText = this.textOutput.substring(lastIndex, hookStart);
      if (precedingText.trim()) {
        this.processedParts.push({ type: 'text', value: precedingText });
      }

      if (fullUrl) {
        if (fullUrl.endsWith('.png')) {
          this.processedParts.push({ type: 'img', value: fullUrl });
        } else if (fullUrl.endsWith('.html')) {
          const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
          this.processedParts.push({ type: 'iframe', value: safeUrl });
        }
      }

      lastIndex = hookEnd;
    });

    const remainingText = this.textOutput.substring(lastIndex);
    if (remainingText.trim()) {
      this.processedParts.push({ type: 'text', value: remainingText });
    }
  }
}
