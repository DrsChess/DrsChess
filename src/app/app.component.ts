import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { Tile } from './domain/tile';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from './core/unsubscriber';
import { Knight } from './domain/knight.model';
import { Direction } from './domain/direction.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends Unsubscriber implements OnInit {
  title = 'DrsChess';

  tiles: Tile[][];

  knightW: Knight;
  knightN: Knight;
  knightE: Knight;
  knightS: Knight;

  statusText: string;
  running: boolean;

  constructor(private appService: AppService) {
    super();
    this.appService.tiles
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((tiles) => (this.tiles = tiles));

    this.appService.knights
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((knights) => {
        this.knightW = knights[0];
        this.knightN = knights[1];
        this.knightE = knights[2];
        this.knightS = knights[3];
      });
  }

  ngOnInit() {}

  public startGame(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.appService.startGame(this).subscribe(
      () => {},
      () => {},
      () => (this.running = false)
    );
  }

  public setStatusText(text: string): void {
    this.statusText = text;
  }
}
