import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProgressBarInterface } from '@core/interfaces/progress-bar.interface';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress" [ngStyle]="{'background-color': progressOptions?.backgroundColor}">
      <div class="progress-bar" [style.width]="progressOptions?.progress + '%'" [ngStyle]="{'background-color': progressOptions?.color}">
        {{progressOptions?.progress}}%
      </div>
    </div>
  `,
  styles: [`
  .progress {
    height: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    margin-bottom: 20px;
    overflow: hidden;
    z-index: 1;
  }
  .progress-bar {
    height: 100%;
    border-radius: 10px;
    transition: 0.4s linear;  
    transition-property: width, background-color;
    background-size: 40px 40px;
    color: #000;
    text-align: center;
    background-image: 
      linear-gradient(
        135deg, 
        rgba(255, 255, 255, .20) 25%, 
        transparent 25%, 
        transparent 50%, 
        rgba(255, 255, 255, .20) 50%, 
        rgba(255, 255, 255, .20) 75%, 
        transparent 75%, 
        transparent
      );
    animation: progress-bar-stripes 1s linear infinite;
  }
  @keyframes progress-bar-stripes {
    from  { background-position: 40px 0; }
    to    { background-position: 0 0; }
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  @Input() progressOptions?: ProgressBarInterface;
  
  ngOnInit(): void {

    if (this.progressOptions && this.progressOptions.progress && this.progressOptions.total) {
      this.progressOptions.progress = (this.progressOptions.progress / this.progressOptions.total) * 100;
    }
  }



}


