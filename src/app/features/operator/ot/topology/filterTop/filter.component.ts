import { AfterViewInit, Component, computed, ElementRef, EventEmitter, inject, Input, OnInit, Output, Renderer2, Signal, signal, ViewChild } from '@angular/core';
import { OTService } from '@features/operator/ot/services/ot.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatInputModule} from '@angular/material/input';
import { MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule} from '@angular/material/form-field';
import { types, TypesInterface , listProtocols } from '../../ot.utility';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { CdkDrag} from '@angular/cdk/drag-drop';
import { flattenObject } from '../gojs.utility';
import * as otInterface from '@features/operator/ot/services/interface';
import { CsvService } from '@core/services';

@Component({
    selector: 'app-ot-topology-filter',
    providers: [CsvService],
    imports: [
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        CdkDrag
    ],
    styleUrl: './filter.component.scss',
    templateUrl: './filter.component.html'
})
export class FilterComponent implements AfterViewInit {
    private _serviceCsv = inject(CsvService);
    private render = inject(Renderer2);
    showInfos = signal<boolean>(true); // show or hide infos div
    viewHorizontal = signal<boolean>(true ); // switch from view horizontal to view vertical
    @ViewChild('extraInfos', { static: true }) extraInfosDiv!: ElementRef;
    @ViewChild('otToolBar', { static: true }) otToolBar!: ElementRef;
    toolBar!: HTMLElement;
    extraInfos!: HTMLElement;
    types: TypesInterface[] = types;
    protocols: {key:string,value:string}[] = listProtocols;
    @Input() form : FormGroup = new FormGroup({
        type : new FormControl(),
        protocol : new FormControl()
    });
    @Input() linksParent!: Signal<any | undefined> ;
    @Input() dataParent!: Signal<any | undefined> ;
    @Input() missingAssets!: Signal<any | undefined> ;
    @Output() submitEvent = new EventEmitter<void>();
    @Output() parentFunctionTrigger = new EventEmitter<void>();
    _service = inject(OTService);
    stats = computed( () => {
      const links = this.linksParent() ?? undefined;
      const data = this.dataParent() ?? undefined;
      const missing = this.missingAssets() ?? undefined;
      let statistics : {
        levels:number,
        zones:number,
        assets:number,
        conversations:number,
        undiscovered:number
      } = {
        levels:0,
        zones:0,
        assets:0,
        conversations:0 ,
        undiscovered: 0
      };
      if(!data || !links || !missing) return statistics;
        statistics.conversations = links.length; // set the number of conversations
        statistics.undiscovered = missing.length; // set the number of undiscovered assets
        data.forEach((item:any) => {
          if(item.isLevel) statistics.levels++; // if isLevel its a layer
          else if(item.isGroup) statistics.zones++; // else if isLevel false and isGroup true its a zone
          else statistics.assets++; // else its an asset
        });

      return statistics;
    });

    ngAfterViewInit(): void {
      this.extraInfos = this.extraInfosDiv.nativeElement;
      this.toolBar = this.otToolBar.nativeElement;// intialize the toolbar element
    }

    onSubmit(){
      console.log({ ...this.form.value });
      this.submitEvent.emit(this.form.value);
    }

    parentFunction(){
      this.parentFunctionTrigger.emit();
    }

    toggleView():boolean {
      console.log(this.viewHorizontal())
      if(this.viewHorizontal() ){
        this.viewHorizontal.set(false);
      }else{
        this.viewHorizontal.set(true);
      }
      return this.viewHorizontal();
    }

  /**
   * Export missing assets in .csv format
   */
  exportDeadLetters(){
    var data = this.missingAssets() || false;
    if(data){
      data = data.map((i: any) => ({ ip: i?.ip,mac: i?.mac , protocol : i?.protocol , protocols: i?.protocolsRaw}));
      return this._serviceCsv.exportAsCsv(data , `missing_assets_${new Date().getTime()}`);
    }
  }
  /**
   * Toggle Hide/show Informations bar
   */
  toggleInfos(){
    if(this.showInfos() == false){
      this.extraInfos.style.display = 'flex';
      this.showInfos.set(true);
    }else{
      this.extraInfos.style.display = 'none';
      this.showInfos.set(false);
    }
  }

    /**
     * fill the div with object information key, value
     * @param data
     */
    showExtraInfos(infos:otInterface.infoDiv){
      // delete nodes list of informations
      // loop for the div children and remove only the list not the header title
      infos.element.childNodes.forEach(node => {
        if(node.nodeName == 'UL') // remove only the ul elements
          infos.element.removeChild(node);
        else{
          if(node.firstChild){
            // if the element is not the ul let the title
            node.firstChild.textContent = infos.title;
          }
        }
      });
      let data = flattenObject(infos.data);
      // create the list that contains the infos node
      const ul = this.getElementForList('infos', data);
      infos.element.appendChild(ul);
    }

    setViewHorizontal(value: boolean) {
      this.viewHorizontal.set(value);
    }
    /**
     *  Recurssif function to return list or nested list for element values
     * @param key
     * @param value
     * @returns
     */
    getElementForList(key: string, value: string | number | object): HTMLElement {  {
      const excludeKeys: string[] = ['loc', 'id', 'key' ]; // list of keys to be excluded from view

      if (typeof value === 'string' || typeof value === 'number') {
        // Create the list element
        const li = this.render.createElement('li');
        const text = this.render.createElement('p');
        const label = this.render.createElement('label');

        // Set the label text
        label.textContent = `${key}: `;

        // Append the label and value to the text element
        text.appendChild(label);
        const textNode = this.render.createText(value.toString());
        text.appendChild(textNode);

        // Append the text element to the list item
        li.appendChild(text);
        return li;
      } else {
        const ul = this.render.createElement('ul');
        const entries = Object.entries(value);

        for (const [k, v] of entries) {
          const li = this.getElementForList(k, v);
          if (li !== undefined) ul.appendChild(li);
        }

          return ul;
        }
      }
    }
}
