import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ContextMenuModel } from "./context-menu.interface";

@Component({
    standalone: true,
    selector: "app-context-menu",
    templateUrl: "./context-menu.component.html",
    styleUrls: ["./context-menu.component.scss"]
})
export class ContextMenuComponent {
  
  @Input()
  contextMenuItems!: Array<ContextMenuModel>;

  @Output()
  onContextMenuItemClick: EventEmitter<any> = new EventEmitter<any>();

  onContextMenuClick(event: MouseEvent, data: any): any {
    this.onContextMenuItemClick.emit({ event, data });
  }
}
