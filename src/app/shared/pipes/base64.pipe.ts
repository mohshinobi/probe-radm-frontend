import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'base64',
  standalone: true
})
export class Base64Pipe implements PipeTransform {

  private domSanitizer = inject(DomSanitizer);

  transform(value: unknown): SafeHtml | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    try {
      const decoded = atob(value);
      return this.domSanitizer.bypassSecurityTrustHtml(decoded);
    } catch (error) {
      console.error('Error decoding base64:', error);
      return null;
    }
  }
}
