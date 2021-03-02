import { Injectable } from '@angular/core';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { Direction } from './domain/direction.enum';
import { Knight } from './domain/knight.model';
import { Tile } from './domain/tile';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _tiles: Tile[][];
  private tiles$: ReplaySubject<Tile[][]>;
  private knights$: ReplaySubject<Knight[]>;

  get tiles(): Observable<Tile[][]> {
    return this.tiles$.asObservable();
  }

  get knights(): Observable<Knight[]> {
    return this.knights$.asObservable();
  }

  readonly knightW: Knight = new Knight(Direction.W);
  readonly knightN: Knight = new Knight(Direction.N);
  readonly knightE: Knight = new Knight(Direction.E);
  readonly knightS: Knight = new Knight(Direction.S);

  constructor() {
    this.tiles$ = new ReplaySubject<Tile[][]>(1);

    this.knights$ = new ReplaySubject<Knight[]>(1);

    this.knightW = new Knight(Direction.W);
    this.knightN = new Knight(Direction.N);
    this.knightE = new Knight(Direction.E);
    this.knightS = new Knight(Direction.S);

    this.knights$.next([
      this.knightW,
      this.knightN,
      this.knightE,
      this.knightS,
    ]);

    this.resetBoard();
  }

  public onClick(tile: Tile) {
    this._tiles.forEach((rows) => {
      rows.forEach((t) => {
        t.hasPlayer = t === tile;
      });
    });
  }

  public setupGame(): void {
    const position = Math.round(Math.random());

    let steps = this.generate2DifferentRandomNumbers(1, 3);

    this.knightW.init(position, steps[0]);
    this.knightE.init((position + 1) % 2, steps[1]);

    steps = this.generate2DifferentRandomNumbers(1, 3);

    this.knightS.init(position, steps[0]);
    this.knightN.init((position + 1) % 2, steps[1]);
  }

  public startGame(): Observable<number> {
    this.resetBoard();
    this.setupGame();

    return interval(1000).pipe(
      take(5),
      finalize(() => {
        this.knightS.move();
        this.knightN.move();
      }),
      map((v) => 5 - v - 1)
    );
  }

  private generate2DifferentRandomNumbers(from: number, to: number): number[] {
    const numbers = Array.from({ length: to - from + 1 }, (_, i) => i + from);

    let index = this.randomIntFromInterval(0, numbers.length - 1);
    const n1 = numbers[index];
    numbers.splice(index, 1);

    index = this.randomIntFromInterval(0, numbers.length - 1);
    const n2 = numbers[index];

    return [n1, n2];
  }

  private resetBoard(): void {
    this.knightE.ready = false;
    this.knightN.ready = false;
    this.knightW.ready = false;
    this.knightS.ready = false;

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

  private randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
