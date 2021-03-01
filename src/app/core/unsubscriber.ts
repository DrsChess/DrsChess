import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable()
export abstract class Unsubscriber implements OnDestroy {
  private _onDestroy$: Subject<void>;

  get onDestroy$(): Observable<void> {
    return this._onDestroy$.asObservable();
  }

  constructor() {
    this._onDestroy$ = new Subject<void>();
  }

  ngOnDestroy() {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }
}