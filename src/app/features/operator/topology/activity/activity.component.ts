import { Component, inject, computed, Renderer2, signal, DestroyRef,ViewChild , ElementRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import HC_networkgraph from 'highcharts/modules/networkgraph';
import { TopologyService } from '@core/services/topology.service';
import { CommonModule } from '@angular/common';
import { NetworkComponent } from '@shared/components/graphs/network/network.component';
import { HeatChart, SankeyChartInterface } from '@core/interfaces';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SankeyComponent } from "@shared/components/graphs/sankey/sankey.component";
import { CommonService } from '@core/services/common.service';
import { HeatMapComponent } from '@shared/components/graphs/heat-map/heat-map.component';
import {map, switchMap} from 'rxjs';
import Highcharts from 'highcharts';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BytesConvertPipe } from '@shared/pipes/bytes-convert.pipe';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";
import {MatTooltip} from "@angular/material/tooltip";
import { CdkDrag} from '@angular/cdk/drag-drop';
import {formatSankey} from "@core/utils/graph-formater.util";

HC_networkgraph(Highcharts);
@Component({
    selector: 'app-activity',
    imports: [MatCardModule, MatIconModule, CommonModule, NetworkComponent, SankeyComponent, HeatMapComponent, MatInputModule, MatFormFieldModule, TimeSelectorComponent, MatTooltip, CdkDrag],
    providers: [BytesConvertPipe],
    templateUrl: './activity.component.html',
    styleUrls: ['./activity.component.scss']
})
export class ActivityComponent {
  private _destroyRef = inject(DestroyRef);
  private _topologyService = inject(TopologyService);
  private _commonService = inject(CommonService);
  currentTime = signal<number>(24);


  title = 'Network / Activity Maps'

  maxNode = signal(20);
  maxLinksByNode = signal(10);
  maxProto = signal(2);
  linkLength = signal(50);

  @ViewChild('infosNode', { static: true }) infosNodeDiv!: ElementRef;

  constructor(private renderer: Renderer2) {
    this._destroyRef.onDestroy(() => {
      Highcharts.setOptions({
        legend: {
          backgroundColor: 'transparent',
          itemStyle: {
            fontFamily: 'Helvetica, Arial, sans-serif',
          }
        }
      })
    });
  }


  macRelations = toSignal(
    toObservable(this.currentTime).pipe(
      switchMap(() => {
        return this._topologyService.getSankeyData(this.currentTime());
      })
    ),
    {
      initialValue: [],
    }
  );

  sankeyData = toSignal(
    toObservable(this.currentTime).pipe(
      switchMap(() =>
        this._topologyService.getSankeyChartData(
          this.currentTime(),
          this.maxNode(),
          this.maxLinksByNode(),
          this.maxProto()
        )
      ),
      map(rawData => formatSankey(rawData)),
      map(formatted => this._topologyService.transformSankeyDataResponse(formatted))
    )
  );

  heatMapChartData = toSignal(
    toObservable(this.currentTime).pipe(
      switchMap(() => {
        return this._topologyService.getHeatmapData();
      })
    )
  );


  readonly heatMapChartOptions = computed<HeatChart>(() => {
    const data = this.heatMapChartData();
    const xAxis = data?.xAxis ?? [];
    const yAxis = data?.yAxis ?? [];
    const datas = data?.data ?? [];
    return {
    title: '',
    xAxis: xAxis,
    yAxis: yAxis,
    data: datas,
    } as HeatChart;
  });

  readonly networkChartOptions = computed<any>(() => {
    const sankeyResponse = this.sankeyData();

    const data = Array.isArray(sankeyResponse?.links) ? sankeyResponse?.links : [];
    const nodes = Array.isArray(sankeyResponse?.nodes) ? sankeyResponse?.nodes : [];

    return {
      linkLength: this.linkLength(),
      data: data,
      nodes: nodes
    };
  });







  readonly macSankeyGraphOptions = computed<SankeyChartInterface>(() => {
    const sankeyResponse = this.macRelations();

    return {
      title: '',
      data: sankeyResponse ? formatSankey(sankeyResponse) : [],
      colors: this._commonService.chartsColors || [],
      backgroundColor: '#1F1F1F',
      height: '505px',
      label: 'Requests',
    };
  });

  /**
   * Show the infos window for the node
   */
  showDetails(event: any): void {

    const ip = event.point.id ?? undefined;
    this.infosNodeDiv.nativeElement.style.display = 'block';
    this.setLinkHref('headTitle',undefined,ip);
    this.setLinkHref('trackSource', `operator/detection/alerts-list?src_ip=${ip}`);
    this.setLinkHref('trackDestination', `operator/detection/alerts-list?dest_ip=${ip}`);
    this.setLinkHref('details', `operator/topology/asset?devLastIP=${ip}`);

  }
/**
 * fill the element by id  with url and text if exists
 */
  private setLinkHref(id: string, url?: string , text?:string ) {
    const element = document.getElementById(id) as HTMLAnchorElement;
    if (element) {
      if( url ) element.href = url;
      if( text ) element.textContent = text;
    }
  }

  /**
   * function to hide the window infos
   */
  hideInfos(e:Event){
    e.preventDefault();
    if( this.infosNodeDiv )  this.infosNodeDiv.nativeElement.style.display = 'none';
  }
}
