import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Tile } from './domain/tile';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from './core/unsubscriber';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends Unsubscriber {
  title = 'DrsChess';

  tiles: Tile[][];

  constructor(private appService: AppService) {
    super();
    this.appService.tiles
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((tiles) => (this.tiles = tiles));
  }
}
