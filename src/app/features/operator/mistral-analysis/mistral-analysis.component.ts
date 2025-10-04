import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { MistralAnalysisService } from './mistral-analysis.service';
import { CommonModule } from '@angular/common';
import { AUTHORIZED_QUESTIONS, AuthorizedQuestion } from '@core/constants/mistral.constants';
import { AnalysisResponse } from '@core/interfaces/mistral-response-interface';

@Component({
    selector: 'app-mistral-analysis',
    templateUrl: './mistral-analysis.component.html',
    styleUrls: ['./mistral-analysis.component.scss'],
    imports: [FormsModule, CommonModule]
})
export class MistralAnalysisComponent {
  @Input() alertDescription!: string | undefined;
  @Input() isPopupVisible!: boolean;
  @Output() closePopup = new EventEmitter<void>();
  @Output() questionSelected = new EventEmitter<AuthorizedQuestion>();

  readonly questions = AUTHORIZED_QUESTIONS;
  selectedQuestion: AuthorizedQuestion | null = null;
  aiAnalysis: string | null = null;
  loading: boolean = false;
  errorMessage: string | null = null;

  _mistralService = inject(MistralAnalysisService);

  selectQuestion(question: AuthorizedQuestion): void {
    // Validation de la question
    if (!AUTHORIZED_QUESTIONS.includes(question)) {
      this.errorMessage = 'Invalid question selected';
      return;
    }

    // Validation de la description d'alerte
    if (!this.alertDescription) {
      this.errorMessage = 'Alert description is missing.';
      return;
    }

    this.loading = true;
    this.selectedQuestion = question;
    this.aiAnalysis = null;
    this.errorMessage = null;

    this._mistralService.aiAnalysis(question, this.alertDescription).subscribe({
      next: (response: AnalysisResponse) => {
        this.aiAnalysis = response.content;
        this.questionSelected.emit(question);
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'An error occurred while processing your request.';
        console.error('Mistral API Error:', error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  close(): void {
    this.closePopup.emit();
  }

  isQuestionSelected(question: AuthorizedQuestion): boolean {
    return this.selectedQuestion === question;
  }
}
