import {
  CheckboxCell2Component,
  CheckboxCellComponent,
  ConfidenceCellComponent,
  DateCellComponent,
  DefaultCellComponent,
  DevianceCellComponent,
  FeedbackCellComponent,
  ImageCellComponent,
  ProgressCellComponent,
  SlideToggleCellComponent,
  StarsCellComponent,
  TrueFalseCellComponent
} from './cell';
import { LinkCellComponent } from './cell/link-cell.component';
import { CellComponent } from './cell-component.interface';
import { Type } from '@angular/core';
import { TableCellTypeEnum } from '@core/enums/table-cell-type.enum';
import { FlagCellComponent } from './cell/flag-cell.component';
import { ActionsCellComponent } from './cell/actions-cell.component';
import { ArrayCellComponent } from './cell/array-cell.component';
import { SeverityCellComponent } from './cell/severity-cell.component';
import { CountCellComponent } from './cell/count-cell.component';
import { HtmlCellComponent } from './cell/html-cell.component';
import { IconBase64CellComponent } from './cell/icon-base64-cell.component';
import { IconCellComponent } from './cell/icon-cell.component';

export class CellBuilder {
  constructor(private _tableCellType: TableCellTypeEnum) {}

  build() {
    const componentMap: { [key in TableCellTypeEnum]: Type<CellComponent> } = {
      [TableCellTypeEnum.TEXT]: DefaultCellComponent,
      [TableCellTypeEnum.CHECKBOX]: CheckboxCellComponent,
      [TableCellTypeEnum.CHECKBOX2]: CheckboxCell2Component,
      [TableCellTypeEnum.DATE]: DateCellComponent,
      [TableCellTypeEnum.SLIDE_TOGGLE]: SlideToggleCellComponent,
      [TableCellTypeEnum.IMAGE]: ImageCellComponent,
      [TableCellTypeEnum.LINK]: LinkCellComponent,
      [TableCellTypeEnum.TRUE_FALSE]: TrueFalseCellComponent,
      [TableCellTypeEnum.FEEDBACK]: FeedbackCellComponent,
      [TableCellTypeEnum.STARS]: StarsCellComponent,
      [TableCellTypeEnum.FLAG]: FlagCellComponent,
      [TableCellTypeEnum.ACTIONS]: ActionsCellComponent,
      [TableCellTypeEnum.ARRAY]: ArrayCellComponent,
      [TableCellTypeEnum.SEVERITY]: SeverityCellComponent,
      [TableCellTypeEnum.CONFIDENCE]: ConfidenceCellComponent,
      [TableCellTypeEnum.DEVIANCE]: DevianceCellComponent,
      [TableCellTypeEnum.COUNT]: CountCellComponent,
      [TableCellTypeEnum.HTML]: HtmlCellComponent,
      [TableCellTypeEnum.ICONB64]: IconBase64CellComponent,
      [TableCellTypeEnum.ICON]: IconCellComponent,
      [TableCellTypeEnum.PROGRESS]: ProgressCellComponent
    };

    return componentMap[this._tableCellType];
  }
}
