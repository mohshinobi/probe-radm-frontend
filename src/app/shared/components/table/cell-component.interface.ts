import { TableColumnInterface } from "@core/interfaces/table-column.interface";

export interface CellComponent {
    element     : any;
    tableColumn : TableColumnInterface;
    cellDatas? : any
  }