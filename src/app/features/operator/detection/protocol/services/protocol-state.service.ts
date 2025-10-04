import { computed, inject, Injectable, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { combineLatest, map, Observable, switchMap, timer } from "rxjs";
import { ProtocolTableConfig } from "./protocol-table-config";
import { ProtocolIndex, ProtocolState } from "./protocol.service";

@Injectable({
  providedIn: 'root'
})
export class ProtocolStateService {

  private _protocolTableConfig = inject(ProtocolTableConfig);

  protected readonly ProtocolIndex = ProtocolIndex;

  private initialState: ProtocolState = {
    protocol: ProtocolIndex.alert,
    timeInterval: 24,
    beginDate: '',
    endDate: '',
    currentMapType: 'src',
    queryParams: { display_col: this._protocolTableConfig.getRequestedColumns(ProtocolIndex.alert) }
  };

  readonly state = signal<ProtocolState>(this.initialState);

  readonly protocol = computed(() => this.state().protocol);
  readonly timeInterval = computed(() => this.state().timeInterval);
  readonly beginDate = computed(() => this.state().beginDate);
  readonly endDate = computed(() => this.state().endDate);
  readonly currentMapType = computed(() => this.state().currentMapType);
  readonly queryParams = computed(() => this.state().queryParams);

  initState() {
    this.state.update(() => this.initialState);
  }

  createChartSignal<T>(
    fetcher: (protocol: ProtocolIndex, time: number, beginDate: string, endDate: string, currentMapType?: string) => Observable<any>,
    transformer: (data: any) => T,
    initialValue: T,
    protocolKey?: ProtocolIndex,
  ) {
    return toSignal(
      combineLatest([
        toObservable(this.protocol),
        toObservable(this.timeInterval),
        toObservable(this.currentMapType),
        toObservable(this.beginDate),
        toObservable(this.endDate),
      ]).pipe(
        switchMap(([protocol]) => {
          if (!protocolKey || protocol === protocolKey) {
            return fetcher(this.protocol(), this.timeInterval(), this.beginDate(), this.endDate(), this.currentMapType()).pipe(map(transformer));
          }
          return timer(1000).pipe(map(() => initialValue));
        })
      ),
      { initialValue }
    );
  }
}