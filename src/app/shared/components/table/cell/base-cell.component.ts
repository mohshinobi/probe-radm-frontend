import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CellComponent } from "../cell-component.interface";
import { TableColumnInterface } from "@core/interfaces/table-column.interface";

@Component({
    template: '',
    styles: `
    // .span {
    //   white-space: nowrap;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    //   display: inline-block;
    //   max-width: 100%;
    //   cursor: pointer;
    // }
    `,
    standalone: false
})
export class BaseCellComponent implements CellComponent {

    @Input()  element        : any;
    @Input()  tableColumn!   : TableColumnInterface;
    @Output() cellDatas      : EventEmitter<any> = new EventEmitter<any>();

  get getDataKeyValue(): {key: string, full?: any, truncated: string } {
      const partSplit = this.tableColumn.dataKey.split('.');
      const partNormal = this.tableColumn.dataKey;

      let current = this.element;

      if (!current[partNormal]) {
        for (const part of partSplit) {
          current = current[part];
        }
      } else{
        current = current[partNormal];
      }

      const maxLength = 100;
      const fullValue = current;
      let truncatedValue = current;

      if (typeof current === 'string' && current.length > maxLength) {
        truncatedValue = `${current.substring(0, maxLength)}...`;
      }

      return { key: this.tableColumn.dataKey, truncated: truncatedValue, full: fullValue };
    }
}
