import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';

export interface DetailField {
  key: string;
  value: any;
  type?: 'text' | 'area' | 'img' | 'date';
  srcImg?: string;
}

@Component({
    selector: 'app-detail',
    imports: [CommonModule, MatInputModule],
    templateUrl: './detail.component.html',
    styleUrl: './detail.component.scss'
})
export class DetailComponent implements OnInit {
  @Input() fields: DetailField[] = [];
  
  title = '';
  textFields  : DetailField[] = [];
  areaFields  : DetailField[] = [];
  imageFields : DetailField[] = [];

  ngOnInit() {
    this.processFields();
  }

  private processFields() {
    const titleField = this.fields.find(field => field.key.toLowerCase() === 'title');
    
    if (titleField) {
      this.title  = titleField.value;
      this.fields = this.fields.filter(field => field.key.toLowerCase() !== 'title');
    }

    this.textFields   = this.fields.filter(field => !field.type || field.type === 'text');
    this.areaFields   = this.fields.filter(field => field.type === 'area');
    this.imageFields  = this.fields.filter(field => field.type === 'img');
  }

  getColumnCount(fields: DetailField[]): number {
    const totalFields   = fields.length;
    return totalFields <= 2 ? totalFields : Math.ceil(Math.sqrt(totalFields));
  }

  domSanitizer = inject(DomSanitizer);
  
  decodeBase64Icon(encoded: string): string {
    try {
      return atob(encoded);
    } catch (error) {
      console.error("Erreur lors du décodage Base64 :", error);
      return "";
    }
  }
}
