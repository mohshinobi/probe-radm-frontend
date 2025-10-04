import { Component, Input, ViewChild, ChangeDetectionStrategy, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CellBuilder } from './cell.builder';
import { CellComponent } from './cell-component.interface';
import { DynamicFieldDirective } from '@shared/directives/dynamic-field.directive';
import { TableColumnInterface } from '@core/interfaces/table-column.interface';
import { TableCellTypeEnum } from '@core/enums';

@Component({
    selector: 'app-cell-table',
    imports: [DynamicFieldDirective],
    template: `<ng-template dynamicField ></ng-template>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicCellComponent implements OnInit {

  @Input() element: any;
  @Input() tableColumn!: TableColumnInterface;
  //@Input() checkedIds: number[] = [];
  @ViewChild(DynamicFieldDirective, { static: true }) dynamicField!: DynamicFieldDirective;
  @Output() cellDatas: EventEmitter<any> = new EventEmitter<any>();

  private componentRef!: any;

  private _checkedIds :number[] = [];

  @Input()
  set checkedIds(value: number[]) {
    this._checkedIds = value;
    if (this.componentRef && this.tableColumn.type === TableCellTypeEnum.CHECKBOX2) {
      this.componentRef.setInput('checkedIds', value);
    }
  }

  get checkedIds(): number[] {
    return this._checkedIds;
  }

  ngOnInit() {    
    this.loadComponent();
  }

  // Charge dynamiquement un composant dans la cellule
  loadComponent() {

    const componentType = new CellBuilder(this.tableColumn.type).build();
    
    // Récupère la référence au conteneur de la vue (ViewContainerRef) à travers la directive
    const viewContainerRef = this.dynamicField.viewContainerRef;
    viewContainerRef.clear();

    // Crée dynamiquement le composant dans le conteneur
    this.componentRef = viewContainerRef.createComponent<CellComponent>(componentType);
    
    // Passe les inputs au composant dynamique (tableColumn et element)
    this.componentRef.setInput('tableColumn', this.tableColumn);
    this.componentRef.setInput('element', this.element);
    if(this.tableColumn.type ===  TableCellTypeEnum.CHECKBOX2) {      
      this.componentRef.setInput('checkedIds', this._checkedIds);
    }
    
    // Si le composant dynamique émet des données (cellDatas), on souscrit à cet événement
    if (this.componentRef.instance.cellDatas) {
      this.componentRef.instance.cellDatas.subscribe((data: any) => {
        this.handleOutput(data);
      });
    }
  }

  // Gère l'émission des données vers le parent quand l'événement est déclenché depuis la cellule
  handleOutput(data: any) {
    this.cellDatas.emit(data);
  }
}