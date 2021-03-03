import { Component, Input, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { AppService } from '../app.service';
import { Unsubscriber } from '../core/unsubscriber';
import { Player } from '../domain/player.model';
import { Tile } from '../domain/tile';

@Component({
  selector: 'drs-tile',
  styleUrls: ['./tile.component.scss'],
  templateUrl: './tile.component.html',
})
export class TileComponent extends Unsubscriber implements OnInit {
  @Input() tile: Tile;

  player: Player;
  color: string;
  hasPlayer: boolean;

  constructor(private appService: AppService) {
    super();
  }

  ngOnInit() {
    this.color = this.tile.color;
    this.appService.player
      .pipe(
        tap((player) => (this.player = player)),
        switchMap((player) =>
          combineLatest([player.playerPosition, player.startingPosition])
        ),
        takeUntil(this.onDestroy$)
      )
      .subscribe((player) => {
        const playerCoords = player[0];
        const startingCoords = player[1];

        this.hasPlayer =
          this.tile.row === playerCoords.row &&
          this.tile.col === playerCoords.col;

        this.color =
          this.tile.row === startingCoords.row &&
          this.tile.col === startingCoords.col
            ? 'yellow'
            : this.tile.color;
      });
  }

  public onClick(): void {
    this.appService.onClick(this.tile);
  }
}
