import { TemplateRef, Component, AfterViewInit, ElementRef, ViewChild, inject, computed, OnDestroy, effect , signal } from '@angular/core';
import { OTService } from '@features/operator/ot/services/ot.service';
import go from 'gojs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule} from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { getDiagram, getZoneTemplate , getLayoutLevels, getPalette , getTemplateAssets , getTemplateLinks , OtGlobal  } from './gojs.utility';
import { ToastrService } from 'ngx-toastr';
import { TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import { FilterComponent } from './filterTop/filter.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { LegendProtoComponent } from './filterBottom/legend.proto.component';
import { protocolsDto } from './filterBottom/protcolsDto';
import { OTServiceConversations } from '@features/operator/ot/services/ot.conversations.service';
import { GojsAsset } from '../services/interface';
import { Router } from '@angular/router';
@Component({
    selector: 'app-topology',
    imports: [
        LegendProtoComponent,
        CommonModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        TimeSelectorComponent,
        FilterComponent
    ],
    templateUrl: './topology.component.html',
    styleUrls: ['./topology.component.scss'],
    providers: [OTService, ToastrService, OTServiceConversations]
})

export class TopologyComponent implements  AfterViewInit,OnDestroy {

  title = 'OT / Topology';
  constructor() {
    go.Diagram.licenseKey  = '';
    effect(() => {
      if (this.allSignalsReady()) {
        this.updateDataDiagram();
        this.updatePaletteData();
        this.protocols();
      }
    }, { allowSignalWrites: true });
  }

  @ViewChild('otDiagram', { static: true }) otDiagram!: ElementRef;
  @ViewChild('otPalette', { static: true }) otPalette!: ElementRef;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  @ViewChild('filterComponent') filterComponent!: FilterComponent;
  @ViewChild('legendProtoComponent') legendProtoComponent!: LegendProtoComponent;

  _service = inject(OTService);
  _serviceConv = inject(OTServiceConversations);
  _toast = inject(ToastrService);
  showInfos = signal<boolean>(true);
  enableSave = signal<boolean>(false);
  diagram!: any;
  container!: HTMLElement;
  palette!: go.Palette;
  limitConversations =  50;
  data = toSignal(this._service.getTopology()); // topology object that includes layers zone and assets
  links = toSignal(this._serviceConv.getLinksForTopology(this.limitConversations));
  assets = toSignal(this._service.getAssets({size: 10000}));

  /**
   * Search missing asset from conversation and return the hole list
   */
  missingIpsAssets = computed(()=>{
    const conversations = this.links();
    const assets = this.assets()?.data ?? [];
    const missing :GojsAsset[] = [];
    if(!conversations || !assets ) return missing;
    for ( const conv of conversations){
      const idSrc = conv.assetSrc.id;
      const idDest = conv.assetDest.id;
      if (!assets.find(a => a.id === idSrc ) && !missing.find(a => a.id === idSrc ) ) missing.push({ ...conv.assetSrc, type: 'unknown',protocolsRaw:conv?.protocolsRaw, protocol: conv?.protocols });
      else if (!assets.find(a => a.id === idDest ) && !missing.find(a => a.id === idDest ) ) missing.push({ ...conv.assetDest, type: 'unknown' ,protocolsRaw:conv?.protocolsRaw, protocol: conv?.protocols});
    }
    console.log(assets , missing);
    return missing;
  })

  /**
   * Get the list of protocolos with there count from conversation
   */
  protocols = computed(() => {
    const links = this.links();
    const protoDto = new protocolsDto();
    if (!links?.length) return [];
    for (const link of links) {
      protoDto.addProto(link.protocols);
    }
    return protoDto.getAll();
  })

  // get the missing assets that are not included in the assets.json
  allSignalsReady = computed(() => {
    const dataReady = Array.isArray(this.data() ?? []) && (this.data() ?? []).length > 0; // check if we have a data
    const linksReady = Array.isArray(this.links() ?? []) // check if we have a data
    const assetsReady = Array.isArray(this.missingIpsAssets() ?? []) && (this.missingIpsAssets() ?? []).length > 0; // check if we have a data
    return dataReady && linksReady && assetsReady;
  });

  viewHorizontal = computed(() => {
      return this.filterComponent?.viewHorizontal?.() || false;
  });

  ngAfterViewInit(): void {
    this.initDiagram();
  }

  initDiagram(): void {

    if (this.diagram) {
      this.diagram.div = null;
      this.diagram.clear();
    }
    if (this.palette) {
      this.palette.div = null;
      this.palette.clear();
    }
    this.diagram  = getDiagram();// intialize the diagram
    this.diagram.div = this.otDiagram.nativeElement; // attach to Dom
    this.diagram.layout = getLayoutLevels(); // add template level
    this.diagram.groupTemplate = getZoneTemplate(); // add template Zone
    this.attachZoneDiagramEvents();
    this.diagram.nodeTemplate = getTemplateAssets(); // add template assets
    this.attachNodeAssetEvents(); // attach events mouse
    this.palette = getPalette(); // intialize the palette
    this.palette.div = this.otPalette.nativeElement; // add palette to DOM
    this.diagram.toolManager.draggingTool.isGridSnapEnabled = true;  // Snap to grid when dragging
    this.diagram.toolManager.draggingTool.isEnabled = true;  // Enable dragging in diagram
    this.diagram.linkTemplate = getTemplateLinks(); // add the links in the diagram
    this.attachNodeLinkEvents(); // attach mouse events
    // this.diagram.redraw();
  }


  /**
   * Reset all diagram data nodes / links / palette
   */
  resetDiagram() {
    this.filterComponent.setViewHorizontal(true);
    this.filterComponent.form.reset(); // reset the top bar form
    this.legendProtoComponent.selected = []; // reset the bottom bar to empty array
    // fafely dispose of the current Diagram and Palette
    if (this.diagram) {
      this.diagram.div = null;
      this.diagram.clear();// clear model data
    }
    if (this.palette) {
      this.palette.div = null;
      this.palette.clear();
    }
    this.initDiagram();
    this.updatePaletteData();
    this.updateDataDiagram();
  }

  toggleInfos(){
    this.filterComponent.toggleInfos();
  }

  /**
   * update the diagram with the fresh data from api layers and links
   */
  updateDataDiagram(){
    const levels:Array<go.ObjectData>[] = this.data() ?? [];
    const links :Array<go.ObjectData>[] = this.links() ?? [];
    if (this.diagram && this.missingIpsAssets() !== null) {
      this.diagram.model = new go.GraphLinksModel(levels, links);
    }
  }


  /**
   * attach event to group zone
   */
  attachZoneDiagramEvents() {
    this.diagram.groupTemplate.click = (event: any, node: go.GraphObject | any) => this.clickZoneEvent(event, node);
    this.diagram.groupTemplate.mouseDrop = (e:any, node:any) => this.dropInZoneEvent(e,node, this.diagram);
  }


  /**
   * Link Events
   * Attach all Mouse Events to the links
   * @param nodeTemplate
   */
  attachNodeLinkEvents(){
    this.diagram.linkTemplate.click = (event:any, link: any) => {
      const data = link.data ?? false;
      this.resetAllZonesToGray(this.diagram);
      if(data)
        this.filterComponent.showExtraInfos({title:OtGlobal.conversation,element: this.filterComponent.extraInfos ,data:data , event});
    };
    this.diagram.linkTemplate.doubleClick = (event:any, node:any) => {
      const data = node.data ?? undefined;
      if(data){
          this.pivotToConversation(data);
      }
    }
  }

  /**
   * Nodes Events
   * Attach all Mouse Events to the assets
   * @param nodeTemplate
   */
  attachNodeAssetEvents(){
    // attach mouseEnter event to nodes
    this.diagram.nodeTemplate.click = (event:any, node:any) => {
      this.resetAllZonesToGray(this.diagram);
      const data = node.data ?? undefined ; // get the data from the node
      const dataAsset = data.raw ?? undefined;  // get the data from asset defined in asset.json file
      if(dataAsset){
        this.filterComponent.showExtraInfos({title:OtGlobal.asset,element: this.filterComponent.extraInfos ,data , event} ); // SHOW INFOS FOR ASSET
      }else{
        this.filterComponent.showExtraInfos({title:OtGlobal.undiscoveredAsset,element: this.filterComponent.extraInfos ,data , event} );// SHOW INFOS FOR  UNDISCOVRED ASSET
      }
    };
    // attach click event to nodes
    this.diagram.nodeTemplate.doubleClick = (e:any, node:any) => {
      const data = node?.data;
      this.pivotToAsset(data.raw ?? {...data})
    };
  }
  /**
   * Upon a drop onto a Group, we try to add the selection as members of the Group.
   * Upon a drop onto the background, or onto a top-level Node, make selection top-level.
   * If this is OK, we're done; otherwise we cancel the operation to rollback everything.
   * Merci Adrien
   * @param e : event
   * @param group : group
   */
  dropInZoneEvent(e:any, group:go.Group, diagramObject:go.Diagram) {
    let asset: any = diagramObject.selection.first()?.data;
    const zoneName = group?.data?.key ?? undefined; // get the id of the zone / group we dropped the object
    const diagram = group.diagram;
    const check:boolean =  /^Z\d*$/.test(zoneName.toUpperCase()); // check if the object name is a zone so Z0010 number preced with Z
    if (!diagram || !check) return;// if not in the diagram and not a zone then do nothing
    const draggedParts = diagram.selection; // get the array of selected elements
    if (draggedParts.count === 0) return; // if there is no selection do nothing
    // if the object is not a zone and not a level then its sure is an asset
    if (!asset.isLevel && !asset.isZone) {
      if (!asset.raw) {
        this._service.addAsset(zoneName, asset).subscribe({
          next: (data) => {
            this._toast.success(`Asset add successfully:${asset.ip}`);
            // if we succuffuly delete the asset we must remove it from the pallette not the diagram
            this.palette.commandHandler.deleteSelection();
          },
          error: (error) => {
            // if we succuffuly delete the asset we must remove it from the diagram not the palette
            this.diagram.commandHandler.deleteSelection();
            this._toast.error(error?.error?.error|| `failed to add asset:${asset.ip} `, `Http`);
          }
        })
      } else {
          // update here is only when we change the zone we drop it in another zone
          // so we get the original object from raw key and then change the belongingzone to group = the id of the zone
          asset = asset.raw ?? {};
          asset.belongingzone = zoneName;
          this.updateAsset(asset);
      }

      diagram.commit((d: any) => {
          draggedParts.each((part: any) => {
              part.containingGroup = group;
              diagramObject.model.setDataProperty(part.data, "group", zoneName);
            });
            diagramObject.model.updateTargetBindings(asset);
      }, "add element in zone");

    }
  };
/**
 * event when we click the zome show infos and change color for distinction
 * @param event
 * @param node
 */
  clickZoneEvent(event: any, node: go.GraphObject | any) {
    const data = (node.data.isZone && node.data.raw) ? node.data.raw : false;
    // reset all zone to lightgray
    this.resetAllZonesToGray(this.diagram);
    if (data) {
      data.assets_inside = data.assets_inside.length ?? 0;
      this.filterComponent.showExtraInfos({ title: OtGlobal.zone, element: this.filterComponent.extraInfos, data: data, event });
      // change the selected/clicked zone to gray
      node.findObject("ZONE").fill = 'gray';
    }
  };
  /**
   * add the data for the panel palette for the missing assets
   */
  updatePaletteData() {
  const data : any[] = this.missingIpsAssets() || [ ];
    if (this.palette && data.length > 0) {
      this.palette.startTransaction();
      this.palette.nodeTemplateMap = this.diagram.nodeTemplateMap;// Set the nodeTemplateMap and layout like the diagram
      this.palette.model.nodeDataArray = data;
      this.palette.commitTransaction('update data in palette');
    }
  }
  /**
   * redirect to the page assets by his id
   * @param data
   */
  pivotToAsset(data:any){
    this._service.navigateToAsset(data.id);
  }
  /**
   * redirect to the page assets by his id
   * @param data
   */
  pivotToConversation(data:any){
    const params = {
      ipSrc: data.assetSrc.ip ?? null,
      ipDest : data.assetDest.ip ?? null,
      macSrc : data.assetSrc.mac ?? null,
      macDest : data.assetDest.mac ?? null
    };
    this._service.navigateToConversationPage(params);
  }

  /**
   * Update asset or move it to another zones only
   * @param asset
   * @returns
   */
  updateAsset(asset :any){
    this._service.updateAsset(asset).subscribe({
      next: (data) => {
        this._toast.success(`Asset updated success ${asset.nomclientusuel}`);
        this.resetDiagram()
      },
      error: (error) => {
        this._toast.error(`failed to update asset ${asset.nomclientusuel} ${error.error}`);
        return false;
      }
    })

  }
/**
 * Filter data diagram nodes and links from the submited data from the filter component
 * @param formData
 */
  filter(event:any , typeEvent:string){

    let data :{ type:string[], protocol:string[], limit:number } = {
      type:[],
      protocol:[],
      limit:0,
    };
    if(typeEvent === 'filter'){
        data = event;
    }else{
        data.protocol = event;
    }
    // update the palette to reset the filter
    this.updateDataDiagram();
     // get the submited data from the filter

     // filter the node
    if(data.type?.length > 0){
      const diagramData = this.diagram.model.nodeDataArray;
      const filtredNodes :any[]= [];
      diagramData.filter( (node:any) => {
        if (node.isLevel || node.isZone) filtredNodes.push(node); // if the node is a zone or level then keep it
        if (!node.isLevel && !node.isZone && data.type.includes(node.type.toLowerCase())) filtredNodes.push(node); // if
      })
      this.diagram.model.nodeDataArray = filtredNodes;
    }
    // filter the links
    if(data.protocol?.length > 0){
      const diagramLinks = this.diagram.model.linkDataArray;
      const filtredLinks :any[]= []
      diagramLinks.filter( (link:any) => {
        if (data.protocol.includes(link.protocols) ) filtredLinks.push(link);
      })

      this.diagram.model.linkDataArray = filtredLinks;
    }
  }
  /**
   * Reset zone settings
   * @param diagram
   */
  resetAllZonesToGray(diagram:go.Diagram){
    diagram.nodes.each((n: any) => {if (n.data.isZone) {n.findObject("ZONE").fill = "lightgray";}});
  }
  /**
   * destory after exit page
   */
  ngOnDestroy(): void {
    if (this.diagram) this.diagram.div = null; // Detach diagram from DOM
    if (this.palette) this.palette.div = null; // Detach palette from DOM
  }

}
