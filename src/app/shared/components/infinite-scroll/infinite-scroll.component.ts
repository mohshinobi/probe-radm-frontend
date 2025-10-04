import { Component, EventEmitter, HostListener, Input, Output, output } from '@angular/core';

@Component({
    selector: 'app-infinite-scroll',
    imports: [],
    templateUrl: './infinite-scroll.component.html',
    styleUrl: './infinite-scroll.component.scss'
})
export class InfiniteScrollComponent {
  @Input() hasMorePages: boolean = true;
  @Input() isLoading: boolean = false;
  @Output() loadMore = new EventEmitter<void>();
  @Output() scrolledToBottom: EventEmitter<void> = new EventEmitter<void>();

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const clientHeight = event.target.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 10 && this.hasMorePages && !this.isLoading) {
      {
        this.loadMore.emit();
      }
    }
  }

}