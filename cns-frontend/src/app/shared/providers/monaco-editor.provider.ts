import { Injectable } from '@angular/core';
import { NgxMonacoEditorConfig } from 'ngx-monaco-editor-v2';

@Injectable({
  providedIn: 'root'
})
export class MonacoEditorProvider {


  public onMonacoLoad(): void {

    (window as any).monaco.editor.setTheme('vs-dark');

    (window as any).monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
      validate: true,
    });
  }

  public defaultOptions: NgxMonacoEditorConfig = {
    baseUrl: 'assets/monaco',
    defaultOptions: {
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastColumn: 0,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      wrappingIndent: 'same'
    },
    onMonacoLoad: () => this.onMonacoLoad()
  };
}