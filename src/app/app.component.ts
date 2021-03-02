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

  secondsToStart: number;

  constructor(private appService: AppService) {
    super();
    this.appService.tiles
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((tiles) => (this.tiles = tiles));

    this.appService.knights.pipe(takeUntil(this.onDestroy$)).subscribe((_) => {
      this.knightW = this.appService.knightW;
      this.knightN = this.appService.knightN;
      this.knightE = this.appService.knightE;
      this.knightS = this.appService.knightS;
    });
  }

  ngOnInit() {}

  public startGame(): void {
    this.appService.startGame().subscribe((v) => (this.secondsToStart = v));
  }
}
