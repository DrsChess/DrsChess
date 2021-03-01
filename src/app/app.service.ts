import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { Tile } from './domain/tile';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _tiles: Tile[][];
  private tiles$: ReplaySubject<Tile[][]>;

  get tiles(): Observable<Tile[][]> {
    return this.tiles$.asObservable();
  }

  constructor() {
    this.tiles$ = new ReplaySubject<Tile[][]>(1);
    this.resetBoard();
  }

  public onClick(tile: Tile) {
    this._tiles.forEach((rows) => {
      rows.forEach((t) => {
        t.hasPlayer = t === tile;
      });
    });
  }

  private resetBoard(): void {
    const tiles: Tile[][] = [];
    for (let row = 0; row < 5; row++) {
      tiles.push([]);
      for (let col = 0; col < 5; col++) {
        tiles[row].push(new Tile(row, col));
      }
    }
    this._tiles = tiles;
    this.tiles$.next(tiles);
  }
}
