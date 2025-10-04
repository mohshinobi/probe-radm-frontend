import { TableCellTypeEnum } from "@core/enums/table-cell-type.enum";

interface ActionsInterface {
  icon: string;
  name: string;
  label: string;
  params?: string[];
  action?: (data: any) => void;
  condition?: (row: any) => boolean; // Fonction optionnelle pour conditionner l'affichage
}
export interface TableColumnInterface {
  name: string;
  dataKey: string;
  type: TableCellTypeEnum;
  url?: string;
  pivot?: boolean;
  filtarable?: boolean;
  isSortable?: boolean;
  params?: string[];
  actions?: ActionsInterface[];
  hideContextMenu?: boolean;
}
