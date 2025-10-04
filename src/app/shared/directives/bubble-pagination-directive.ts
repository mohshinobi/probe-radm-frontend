import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Directive({
  selector: '[appBubblePagination]',
  standalone: true,
})
export class BubblePaginationDirective
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Output() pageIndexChangeEmitter: EventEmitter<number> =
    new EventEmitter<number>();

  @Input() showFirstButton = true;
  @Input() showLastButton = true;
  @Input() renderButtonsNumber = 2;
  @Input() appCustomLength = 0;
  @Input() hideDefaultArrows = false;
  @Input() pageSizeCustomValue = 10;

  private dotsEndRef!: HTMLElement;
  private dotsStartRef!: HTMLElement;
  private bubbleContainerRef!: HTMLElement;
  private buttonsRef: HTMLElement[] = [];
  private destroy$ = new Subject<void>();
  private url: string = '';

  constructor(
    @Host() private readonly matPag: MatPaginator,
    private elementRef: ElementRef,
    private ren: Renderer2,
    private router: Router
  ) {
    this.url = this.router.url;
  }

  ngAfterViewInit(): void {
    this.styleDefaultPagination();
    this.createBubbleDivRef();

    // Vérifiez l'URL et exécutez `renderButtons` seulement si l'URL est différente de `/operator/detection/alerts-list`
    if (this.url !== '/operator/detection/alerts-list') {
      this.renderButtons();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (!changes['appCustomLength']?.firstChange &&
        changes['appCustomLength']) ||
      (!changes['pageSizeCustomValue']?.firstChange &&
        changes['pageSizeCustomValue'])
    ) {
      // Exécutez la logique lorsque l'URL est égale à '/operator/detection/alerts-list'
      if (this.url === '/operator/detection/alerts-list') {
        this.removeButtons();
        this.switchPage(0);
      } else {
        // Sinon, exécutez les méthodes supplémentaires
        this.removeButtons();
        this.switchPage(0);
        this.renderButtons();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderButtons(): void {
    if (this.url !== '/operator/detection/alerts-list') {
      this.buildButtons(); 
    }

    this.matPag.page
      .pipe(
        map((e) => [e.previousPageIndex ?? 0, e.pageIndex]),
        startWith([0, 0]),
        takeUntil(this.destroy$)
      )
      .subscribe(([prev, curr]) => {
        this.changeActiveButtonStyles(prev, curr);
      });
  }

  private changeActiveButtonStyles(previousIndex: number, newIndex: number) {
    const previouslyActive = this.buttonsRef[previousIndex];
    const currentActive = this.buttonsRef[newIndex];

    if (previouslyActive) {
      this.ren.removeClass(previouslyActive, 'g-bubble__active');
    }

    if (currentActive) {
      this.ren.addClass(currentActive, 'g-bubble__active');
    }

    this.buttonsRef.forEach((button) =>
      this.ren.setStyle(button, 'display', 'none')
    );

    const renderElements = this.renderButtonsNumber;
    const endDots = newIndex < this.buttonsRef.length - renderElements - 1;
    const startDots = newIndex - renderElements > 0;

    const firstButton = this.buttonsRef[0];
    const lastButton = this.buttonsRef[this.buttonsRef.length - 1];

    if (this.showLastButton) {
      if (this.dotsEndRef) {
        this.ren.setStyle(
          this.dotsEndRef,
          'display',
          endDots ? 'block' : 'none'
        );
      }
      if (lastButton) {
        this.ren.setStyle(lastButton, 'display', endDots ? 'flex' : 'none');
      }
    }

    if (this.showFirstButton) {
      this.ren.setStyle(
        this.dotsStartRef,
        'display',
        startDots ? 'block' : 'none'
      );
      if (firstButton) {
        this.ren.setStyle(firstButton, 'display', startDots ? 'flex' : 'none');
      }
    }

    const startingIndex = startDots ? newIndex - renderElements : 0;
    const endingIndex = endDots
      ? newIndex + renderElements
      : this.buttonsRef.length - 1;

    for (let i = startingIndex; i <= endingIndex; i++) {
      const button = this.buttonsRef[i];
      if (button) {
        this.ren.setStyle(button, 'display', 'flex');
      }
    }
  }

  private styleDefaultPagination() {
    const nativeElement = this.elementRef.nativeElement;
    // const itemsPerPage = nativeElement.querySelector('.mat-mdc-paginator-page-size');
    const howManyDisplayedEl = nativeElement.querySelector(
      '.mat-mdc-paginator-range-label'
    );
    const previousButton = nativeElement.querySelector(
      'button.mat-mdc-paginator-navigation-previous'
    );
    const nextButtonDefault = nativeElement.querySelector(
      'button.mat-mdc-paginator-navigation-next'
    );

    if (howManyDisplayedEl) {
      this.ren.setStyle(howManyDisplayedEl, 'position', 'absolute');
      this.ren.setStyle(howManyDisplayedEl, 'left', '0');
      this.ren.setStyle(howManyDisplayedEl, 'color', '#919191');
      this.ren.setStyle(howManyDisplayedEl, 'font-size', '14px');
    }

    if (this.hideDefaultArrows) {
      if (previousButton) this.ren.setStyle(previousButton, 'display', 'none');
      if (nextButtonDefault)
        this.ren.setStyle(nextButtonDefault, 'display', 'none');
    }
  }

  private createBubbleDivRef(): void {
    const actionContainer = this.elementRef.nativeElement.querySelector(
      'div.mat-mdc-paginator-range-actions'
    );
    const nextButtonDefault = this.elementRef.nativeElement.querySelector(
      'button.mat-mdc-paginator-navigation-next'
    );

    if (actionContainer && nextButtonDefault) {
      this.bubbleContainerRef = this.ren.createElement('div');
      this.ren.addClass(this.bubbleContainerRef, 'g-bubble-container');
      this.ren.insertBefore(
        actionContainer,
        this.bubbleContainerRef,
        nextButtonDefault
      );
    }
  }

  private buildButtons(): void {
    const neededButtons = Math.ceil(this.appCustomLength / this.matPag.pageSize);

    if (neededButtons === 1) {
      this.ren.setStyle(this.elementRef.nativeElement, 'display', 'none');
      return;
    }

    this.buttonsRef = [this.createButton(0)];
    this.dotsStartRef = this.createDotsElement();

    for (let index = 1; index < neededButtons - 1; index++) {
      this.buttonsRef.push(this.createButton(index));
    }

    this.dotsEndRef = this.createDotsElement();
    this.buttonsRef.push(this.createButton(neededButtons - 1));
  }

  private removeButtons(): void {
    this.buttonsRef.forEach((button) => {
      if (button && button.parentNode) {
        this.ren.removeChild(button.parentNode, button);
      }
    });
    this.buttonsRef = [];
  }

  private createButton(i: number): HTMLElement {
    const bubbleButton = this.ren.createElement('div');
    const text = this.ren.createText(String(i + 1));

    this.ren.addClass(bubbleButton, 'g-bubble');
    this.ren.setStyle(bubbleButton, 'margin-right', '8px');
    this.ren.appendChild(bubbleButton, text);

    this.ren.listen(bubbleButton, 'click', () => {
      this.switchPage(i);
    });

    this.ren.appendChild(this.bubbleContainerRef, bubbleButton);
    this.ren.setStyle(bubbleButton, 'display', 'none');

    return bubbleButton;
  }

  private createDotsElement(): HTMLElement {
    const dotsEl = this.ren.createElement('span');
    const dotsText = this.ren.createText('.....');

    this.ren.setStyle(dotsEl, 'font-size', '18px');
    this.ren.setStyle(dotsEl, 'margin-right', '8px');
    this.ren.setStyle(dotsEl, 'padding-top', '6px');
    this.ren.setStyle(dotsEl, 'color', '#919191');

    this.ren.appendChild(dotsEl, dotsText);
    this.ren.appendChild(this.bubbleContainerRef, dotsEl);
    this.ren.setStyle(dotsEl, 'display', 'none');

    return dotsEl;
  }

  private switchPage(i: number): void {
    const previousPageIndex = this.matPag.pageIndex;
    this.matPag.pageIndex = i;
    this.matPag['_emitPageEvent'](previousPageIndex);
    this.pageIndexChangeEmitter.emit(i);
  }
}