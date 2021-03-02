import { Injectable } from '@angular/core';
import { interval, Observable, ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
import { AppComponent } from './app.component';
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

  private knightW: Knight;
  private knightN: Knight;
  private knightE: Knight;
  private knightS: Knight;

  private playerClickAllowed: boolean;
  private playerMoves: number[];

  get tiles(): Observable<Tile[][]> {
    return this.tiles$.asObservable();
  }

  get knights(): Observable<Knight[]> {
    return this.knights$.asObservable();
  }

  constructor() {
    this.tiles$ = new ReplaySubject<Tile[][]>(1);

    this.knights$ = new ReplaySubject<Knight[]>(1);

    this.resetBoard();
  }

  public onClick(tile: Tile) {
    if (this.playerClickAllowed) {
      this._tiles.forEach((rows) => {
        rows.forEach((t) => {
          t.hasPlayer = t === tile;
        });
      });
    }
  }

  public startGame(component: AppComponent): Observable<number> {
    this.resetBoard();
    this.setupGame();

    const kill$ = new Subject<void>();
    kill$.pipe(takeUntil(kill$)).subscribe(() => kill$.complete());

    const start = 5;

    return interval(1000).pipe(
      take(30),
      takeUntil(kill$),
      tap((v) => {
        if (v < start) {
          this.playerClickAllowed = true;

          component.setStatusText(
            `Find your starting position! Seconds left: ${5 - v}`
          );
          return;
        }
        if (v === start) {
          this.playerClickAllowed = false;

          const playerPositionStart = this.getPlayerPosition();
          if (playerPositionStart.length === 0) {
            // player did not click, shower slimes on them
            kill$.next();
            component.setStatusText(
              `You did not choose a starting location. Stopping game.`
            );
            return;
          }

          component.setStatusText(`Moving North and South`);
          this.knightS.move();
          this.knightN.move();
          return;
        }
        if (v === start + 2) {
          component.setStatusText(`Explosion`);
          return;
        }
        if (v >= start + 3 && v < start + 8) {
          this.playerClickAllowed = true;

          component.setStatusText(
            `Move your first amount of steps! Seconds left: ${
              5 + (start + 3 - v)
            }`
          );
          return;
        }
        if (v === start + 8) {
          this.playerClickAllowed = false;

          component.setStatusText(`Moving East and West`);
          this.knightE.move();
          this.knightW.move();
          return;
        }
        if (v === start + 10) {
          component.setStatusText(`Explosion`);
          return;
        }
        if (v >= start + 11) {
          this.playerClickAllowed = true;

          component.setStatusText(
            `Move your second amount of steps! Seconds left: ${
              5 + (start + 11 - v)
            }`
          );
          return;
        }
      })
    );
  }

  private setupGame(): void {
    const position = Math.round(Math.random());

    let steps = this.generate2DifferentRandomNumbers(1, 3);

    this.knightW.init(position, steps[0]);
    this.knightE.init((position + 1) % 2, steps[1]);

    steps = this.generate2DifferentRandomNumbers(1, 3);

    this.knightS.init(position, steps[0]);
    this.knightN.init((position + 1) % 2, steps[1]);

    this.playerMoves = this.generate2DifferentRandomNumbers(2, 4);
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
    this.playerClickAllowed = false;

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

  private getPlayerPosition(): number[] {
    for (let row = 0; row < this._tiles.length; row++) {
      for (let col = 0; col < this._tiles[row].length; col++) {
        if (this._tiles[row][col].hasPlayer) {
          return [row, col];
        }
      }
    }

    return [];
  }
}
