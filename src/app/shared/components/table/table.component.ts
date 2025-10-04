import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { TableColumnInterface } from '@core/interfaces';
import { DynamicInputComponent } from '../form/dynamic-input.component';
import { BaseField } from '../form/fields';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { DynamicCellComponent } from './dynamic-cell.component';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { ContextMenuModel } from '../context-menu/context-menu.interface';
import { ContextMenuComponent } from '../context-menu/context-menu.comonents';
import { DetailComponent, DetailField } from './detail/detail.component';
import { TableCellTypeEnum } from '@core/enums';


enum MenuEvent {
  Filter = 'filter',
  Exclude = 'exclude',
  Reset = 'reset',
  Rule = 'rule',
}

export interface ChipFilterDataInterface {
  key: string;
  value: string;
  columnName: string;
}
@Component({
    selector: 'app-table',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DynamicInputComponent,
        MatDrawerContainer,
        MatDrawer,
        MatCheckbox,
        MatIcon,
        DynamicCellComponent,
        MatPaginator,
        MatTableModule,
        MatButtonModule,
        MatSortModule,
        MatChipsModule,
        ContextMenuComponent,
        DetailComponent,
    ],
    animations: [
        trigger('detailExpand', [
            state('collapsed,void', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit {
  @Input({ required: true }) tableColumns!: TableColumnInterface[];
  @Input({ required: true }) displayedColumns!: string[];
  @Input({ required: true }) set tableDataResponse(data: any) {
    if (data) {
      this.updateTableDataSource(data);
      this.adjustColumns();
    }
  }
  @Input() length = 10;

  pageSize = length;
  direction: string | undefined;

  @Input() paginationSizes = [10, 20, 50, 100];
  @Input() defaultPageSize = this.paginationSizes[0];
  @Input() isPageable = true;
  @Input() isFilterable = true;
  @Input() isSelectColumn = true;
  @Input() inputExpandDatas: any = null;
  @Input() seeMore = true;

  @Input() expandableDatas: boolean = false;

  @Input()
  expandableDetailsData: DetailField[] = [];

  @Input() isSelectable: boolean = true;

  @Input() checkField = '';

  @Input()
  expandableDetailsDataFunction: (data: any) => DetailField[] = () => [];

  @Input() seeMoreLink: string = '/operator/detection/alerts-list';

  @Input() form!: FormGroup;
  @Input() fields!: BaseField<string | number>[];

  @Output() tableActions = new EventEmitter<any>();
  @Output() cellDatas = new EventEmitter<any>();
  @Output() expandDatas = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<{ page: number; size: number }>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawerFilter') drawerFilter!: MatDrawer;
  @ViewChild('drawerColumn') drawerColumn!: MatDrawer;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild('customPaginator') customPaginator!: TemplateRef<any>;

  tableDataSource = new MatTableDataSource<any[]>([]);
  expandedElement: any | null = null;
  readonly chipFilterData = signal<ChipFilterDataInterface[]>([]);

  router = inject(Router);

  tableCellCheckbox: TableCellTypeEnum = TableCellTypeEnum.CHECKBOX2;

  ngOnInit(): void {
    this.adjustColumns();
    this.setupDateValidation();
  }

  private setupDateValidation(): void {
    const startDateControl = this.form.get('startDate');
    const endDateControl = this.form.get('endDate');

    if (!startDateControl || !endDateControl) return;

    startDateControl.valueChanges.subscribe(startDate =>
      this.validateDateRange(startDate, 'startDate', endDateControl));

    endDateControl.valueChanges.subscribe(endDate =>
      this.validateDateRange(endDate, 'endDate', startDateControl));
  }

  private validateDateRange(date: string, controlName: 'startDate' | 'endDate', otherControl: any): void {
    if (!date) return;

    const currentDate = new Date();
    const dateValue = new Date(date);
    const otherDate = otherControl.value ? new Date(otherControl.value) : null;

    // Reset if date is in future
    if (dateValue > currentDate) {
      this.form.get(controlName)?.setValue(null);
      return;
    }

    // Reset other control if dates are invalid
    if (otherDate && (
      (controlName === 'startDate' && dateValue > otherDate) ||
      (controlName === 'endDate' && dateValue < otherDate)
    )) {
      otherControl.setValue(null);
    }
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
  }

  // Met à jour la source de données de la table
  private updateTableDataSource(data: any): void {
    this.tableDataSource = new MatTableDataSource<any>(data);
  }

  // Obtient le type de la colonne (par exemple, string, number) en fonction de ses données
  private getColumnType(columnName: string): string {
    const sampleData = this.tableDataSource.data[0];
    return typeof this.getNestedData(columnName, sampleData) || 'unknown';
  }

  // Obtient les données imbriquées pour une colonne donnée
  getNestedData(columnName: string, data: any): any {
    return columnName.split('.').reduce((current, key) => current?.[key], data);
  }

  // Gère le changement de tri et émet un événement pour l'action correspondante
  announceSortChange(sortState: Sort): void {
    const { active, direction } = sortState;
    const columnType = this.getColumnType(active);
    const isTimestamp = active.includes('timestamp');

    // Si la colonne est une chaîne, ajoute `.keyword` pour les tri spécifiques aux chaînes
    sortState.active =
      columnType === 'string' && !isTimestamp ? `${active}.keyword` : active;

    this.tableActions.emit({ sortedBy: sortState.active, orderBy: direction });
  }

  // Applique le filtrage en fonction des valeurs du formulaire
  onFilter(): void {
    this.resetPaginator();
    const formData = this.form.getRawValue();
    
    Object.entries(formData)
      .filter(([_, value]) => value)
      .forEach(([key, value]) => {
        this.processFormField(key, value);
      });

    this.tableActions.emit(this.form.getRawValue());
  }

  private processFormField(key: string, value: any): void {
    const columnName = this.getColumnName(key);
    const processedValue = this.normalizeValue(value);

    if (processedValue) {
      this.form.controls[key].setValue(processedValue);
      this.updateChipFilterData(key, processedValue, columnName);
    }
  }

  private getColumnName(key: string): string {
    return this.tableColumns.find(column => column.dataKey === key)?.name || '';
  }

  private normalizeValue(value: any): string {
    if (Array.isArray(value)) {
      return value.map(v => v.trim()).toString();
    }
    return typeof value === 'string' ? value.trim() : value;
  }

  // Réinitialise les filtres et les valeurs de la table
  reset(): void {
    this.resetPaginator();
    this.form.reset();
    this.tableActions.emit(this.createResetObject());
    this.chipFilterData.set([]);
  }

  // Réinitialise la pagination à la première page et la taille par défaut
  private resetPaginator(): void {
    this.paginator.firstPage();
    this.paginator.pageSize = this.paginationSizes[0];
  }

  // Crée un objet de réinitialisation avec les valeurs par défaut
  private createResetObject(): any {
    this.paginator.firstPage();
    return {
      //page: 1,
      size: this.paginationSizes[0],
      display_col: this.displayedColumns,
      startDate: '',
      endDate: '',
      ...Object.fromEntries(this.displayedColumns.map((col) => [col, null])),
    };
  }

  @ViewChild('tableContainer') tableContainer!: ElementRef;

  // Gère les événements de pagination
  handlePageEvent(event: PageEvent): void {
    const basePayload = {
      page: event.pageIndex + 1,
      size: event.pageSize,
    };

    const isAlertsPage = [
      '/operator/detection/alerts-list',
      '/operator/detection/source'
    ].includes(this.router.url);

    const payload = isAlertsPage
      ? { ...basePayload, pagePrevious: event.previousPageIndex }
      : basePayload;

    this.tableActions.emit(payload);
    this.scrollToTop();
  }

  private scrollToTop(): void {
    if (this.tableContainer) {
      this.tableContainer.nativeElement.scrollTop = 0;
    }
  }

  // Ajoute ou retire une colonne dans le tableau
  toggleColumn(column: string): void {
    const index = this.displayedColumns.indexOf(column);
    index >= 0
      ? this.displayedColumns.splice(index, 1)
      : this.displayedColumns.push(column);
    this.adjustColumns();
  }

  // Ajuste les colonnes à afficher
  private adjustColumns(): void {
    if (this.tableColumns && this.displayedColumns) {
      const validColumns = this.tableColumns.map((col) => col.dataKey);
      this.displayedColumns = this.displayedColumns.filter((col) =>
        validColumns.includes(col)
      );
      this.ensureActionAndExpandColumns();
    }
  }

  // Vérifie que les colonnes d'action et d'expansion sont bien positionnées à la fin de la table
  private ensureActionAndExpandColumns(): void {
    this.tableColumns.forEach((column) => {
      if (column.actions) {
        this.moveColumnToEnd('actions');
        return;
      }
    });
    if (this.expandableDatas) this.moveColumnToEnd('expand');
  }

  // Déplace une colonne à la fin de la liste des colonnes affichées
  private moveColumnToEnd(column: string): void {
    this.displayedColumns = this.displayedColumns.filter(
      (col) => col !== column
    );
    this.displayedColumns.push(column);
  }

  // Envoie les données des cellules sélectionnées ou modifiées
  sendCellDatas(cellDatas: any): void {
    if (cellDatas.actionName === 'checkbox') {
      const id = cellDatas.id;
      if (cellDatas.checked && !this.selectedIds.includes(id)) {
        this.selectedIds.push(id);
      } else if (!cellDatas.checked) {
        this.selectedIds = this.selectedIds.filter(i => i !== id);
      }
    }
    this.cellDatas.emit(cellDatas);
  }

  sendExpande(data: any) {
    this.expandableDetailsData = [];
    if (!data) {
      return;
    }
    this.expandDatas.emit(data);
  }

  // Met en majuscule les premières lettres des noms de colonnes
  strUcFirst(name: string) {
    name = name.toLowerCase();
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  gotToSeeMore() {
    this.router.navigateByUrl(this.seeMoreLink);
  }

  updateChipFilterData(key: string, value: string, columnName: string) {

    if (key === 'startDate') columnName = 'From';
    if (key === 'endDate') columnName = 'To';

    this.chipFilterData.update((keywords) => {
      const index = keywords.findIndex((keyword) => keyword.key === key);
      if (index !== -1) {
        return keywords.map((keyword, i) =>
          i === index ? { ...keyword, value } : keyword
        );
      } else {
        return [...keywords, { key, value, columnName }];
      }
    });
    if (this.form.controls[key])
      this.form.controls[key].setValue(value);
  }

  removeChipFilterKey(keyword: string) {
    this.chipFilterData.update((keywords) =>
      keywords.filter((data) => data.key !== keyword)
    );
    if (this.form.controls[keyword])
      this.form.controls[keyword].reset();
    this.tableActions.emit({ [keyword]: '' });
  }

  isContextMenuVisible = false;
  contextMenuItems: ContextMenuModel[] = [
    { menuText: 'Filter', menuEvent: MenuEvent.Filter },
    { menuText: 'Exclude', menuEvent: MenuEvent.Exclude },
    { menuText: 'Reset', menuEvent: MenuEvent.Reset },
  ];

  contextMenuPosition = { x: 0, y: 0 };
  contextMenuData!: ChipFilterDataInterface;
  itemData: any;

  showContextMenu(
    event: MouseEvent,
    contextMenuData: ChipFilterDataInterface,
    hideContextMenu?: boolean,
    element?: any
  ): void {
    if (this.shouldSkipContextMenu(hideContextMenu, contextMenuData)) {
      return;
    }

    this.updateContextMenuItems(contextMenuData);
    this.setContextMenuState(event, contextMenuData, element);
  }

  private shouldSkipContextMenu(
    hideContextMenu?: boolean,
    contextMenuData?: ChipFilterDataInterface
  ): boolean {
    return (
      hideContextMenu ||
      typeof contextMenuData?.value === 'undefined' ||
      contextMenuData?.key === 'actions' ||
      contextMenuData?.key === 'alert_count'
    );
  }

  private updateContextMenuItems(contextMenuData: ChipFilterDataInterface): void {
    const baseMenuItems: ContextMenuModel[] = [
      { menuText: 'Filter', menuEvent: MenuEvent.Filter },
      { menuText: 'Exclude', menuEvent: MenuEvent.Exclude },
      { menuText: 'Reset', menuEvent: MenuEvent.Reset },
    ];

    const ruleMenuItem: ContextMenuModel = { menuText: 'See Rule', menuEvent: MenuEvent.Rule };

    this.contextMenuItems = contextMenuData.key === 'alert.signature'
      ? [...baseMenuItems, ruleMenuItem]
      : baseMenuItems;
  }

  private setContextMenuState(
    event: MouseEvent,
    contextMenuData: ChipFilterDataInterface,
    element?: any
  ): void {
    this.itemData = element || this.itemData;
    this.contextMenuData = contextMenuData;
    this.isContextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  get contextMenuStyle(): Record<string, string> {
    return {
      position: 'fixed',
      left: `${this.contextMenuPosition.x}px`,
      top: `${this.contextMenuPosition.y}px`,
    };
  }

  private readonly menuHandlers = {
    [MenuEvent.Filter]: () => this.handleFilter(),
    [MenuEvent.Exclude]: () => this.handleExclude(),
    [MenuEvent.Reset]: () => this.handleReset(),
    [MenuEvent.Rule]: () => this.handleRule()
  };

  private handleFilter(): void {
    this.updateFilterAndEmit(this.contextMenuData.value);
  }

  private handleExclude(): void {
    this.updateFilterAndEmit(`!${this.contextMenuData.value}`);
  }

  private handleReset(): void {
    this.removeChipFilterKey(this.contextMenuData.key);
    this.tableActions.emit({ [this.contextMenuData.key]: '' });
  }

  private handleRule(): void {
    this.cellDatas.emit({
      actionName: 'redirectToRule',
      signature: this.contextMenuData.value,
      signature_id: this.itemData?.alert?.signature_id,
    });
  }

  private updateFilterAndEmit(value: string): void {
    this.updateChipFilterData(
      this.contextMenuData.key,
      value,
      this.contextMenuData.columnName
    );
    this.tableActions.emit({ [this.contextMenuData.key]: value });
  }

  handleMenuItemClick(menuEvent: { data: MenuEvent }): void {
    this.resetPaginator();
    const handler = this.menuHandlers[menuEvent.data];
    handler ? handler() : console.warn('Unhandled menu event:', menuEvent);
  }

  @HostListener('document:click')
  documentClick(): void {
    this.isContextMenuVisible = false;
  }

  selectedIds: any[] = [];

  isSelected(element: any): boolean {
    return this.selectedIds.includes(element.id); // ou full
  }

  isAllSelected(): boolean {
    return this.tableDataSource.data.length > 0 &&
      this.selectedIds.length === this.tableDataSource.data.length;
  }

  isIndeterminate(): boolean {
    return this.selectedIds.length > 0 && !this.isAllSelected();
  }

  toggleAll(checked: boolean): void {
    this.selectedIds = checked
      ? this.tableDataSource.data.map((row: any) => {
        this.emitCellData(row, true);
        if (this.checkField) {
          return row[this.checkField];
        }
        return row.id;

      })
      : this.tableDataSource.data.map((row: any) => {
        this.emitCellData(row, false);
        return null;
      }).filter(id => id !== null);
  }

  private emitCellData(row: any, checked: boolean): void {
    const updatedRow = { ...row, actionName: 'checkbox', checked };
    this.cellDatas.emit(updatedRow);
  }

  toggleOne(checked: boolean, element: any): void {
    const id = element.id;
    if (checked && !this.selectedIds.includes(id)) {
      this.selectedIds.push(id);
    } else if (!checked) {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    }
  }
}
