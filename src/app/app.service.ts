import { Injectable } from '@angular/core';
import { interval, Observable, ReplaySubject, Subject, timer } from 'rxjs';
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
  private onlyAllowClickOnHighlighted: boolean;

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
    if (
      !this.playerClickAllowed ||
      (this.playerClickAllowed &&
        this.onlyAllowClickOnHighlighted &&
        !tile.highLight)
    ) {
      return;
    }
    this._tiles.forEach((rows) => {
      rows.forEach((t) => {
        t.hasPlayer = t === tile;
      });
    });
  }

  public startGame(component: AppComponent): Observable<number> {
    this.playerClickAllowed = false;

    this.resetBoard();
    this.setupGame();

    component.setPlayerMoves(this.playerMoves);

    const kill$ = new Subject<void>();

    const start = 5;
    let playerPosition: number[];

    return interval(1000).pipe(
      take(30),
      takeUntil(kill$),
      tap((v) => {
        // Time before the mechanic resolves (22 seconds?)
        if (v < start) {
          this.playerClickAllowed = true;

          component.setStatusText(
            `Find your starting position! Seconds left: ${5 - v}`
          );
          return;
        }
        // The first knights move
        if (v === start) {
          this.playerClickAllowed = false;

          playerPosition = this.getPlayerPosition();
          if (playerPosition.length === 0) {
            // player did not click, shower slimes on them
            this.stopGame(kill$);
            component.setStatusText(
              `You did not choose a starting location. DOOM.`
            );
            return;
          }

          component.setStatusText(`Moving North and South`);
          this.knightS.move();
          this.knightN.move();
          return;
        }
        // The rows explode
        if (v === start + 2) {
          this.setRowExplosions();

          if (playerPosition[0] === this.knightS.target) {
            component.setStatusText(
              `Explosion: The row you are on was hit by the knight walking south!! DOOOM`
            );
            this.stopGame(kill$);
            return;
          }
          if (playerPosition[0] === this.knightN.target) {
            component.setStatusText(
              `Explosion: The row you are on was hit by the knight walking north!! DOOOM`
            );
            this.stopGame(kill$);
            return;
          }

          component.setStatusText(`Explosion! You are safe!`);
          return;
        }
        // Time to move the first steps (5 seconds?)
        if (v >= start + 3 && v < start + 8) {
          this.playerClickAllowed = true;

          this.highLightReachableSpots(playerPosition, this.playerMoves[0]);

          component.setStatusText(
            `Move your first amount of steps (${
              this.playerMoves[0]
            })! Seconds left: ${5 + (start + 3 - v)}`
          );
          return;
        }
        // The second knights move
        if (v === start + 8) {
          this.playerClickAllowed = false;

          this.removeHighLight();
          this.onlyAllowClickOnHighlighted = false;

          playerPosition = this.getPlayerPosition();

          component.setStatusText(`Moving East and West`);
          this.knightE.move();
          this.knightW.move();
          return;
        }
        // The columns explode
        if (v === start + 10) {
          this.setColExplosions();

          if (playerPosition[1] === this.knightE.target) {
            component.setStatusText(
              `Explosion: The row you are on was hit by the knight walking east!! DOOOM`
            );
            this.stopGame(kill$);
            return;
          }
          if (playerPosition[1] === this.knightW.target) {
            component.setStatusText(
              `Explosion: The row you are on was hit by the knight walking west!! DOOOM`
            );
            console.log(playerPosition);
            console.log(this.knightW.target);
            this.stopGame(kill$);
            return;
          }

          component.setStatusText(`Explosion! You are safe!`);
          return;
        }
        // Time to move the second steps (? seconds?)
        if (v >= start + 11 && v < start + 16) {
          this.playerClickAllowed = true;

          this.highLightReachableSpots(playerPosition, this.playerMoves[1]);

          component.setStatusText(
            `Move your second amount of steps (${
              this.playerMoves[1]
            })! Seconds left: ${5 + (start + 11 - v)}`
          );
          return;
        }
        if (v === start + 16) {
          this.playerClickAllowed = false;

          this.removeHighLight();
          this.onlyAllowClickOnHighlighted = false;

          playerPosition = this.getPlayerPosition();
          if (playerPosition[0] !== 2 || playerPosition[1] !== 4) {
            component.setStatusText(
              `You did not reach the target tile. DOOOOOM`
            );
          } else {
            component.setStatusText(
              `You reached the goal in time without getting hit. Good job!`
            );
          }

          this.stopGame(kill$);
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

  private findReachableTiles(
    playerPosition: number[],
    steps: number
  ): number[][] {
    const result: number[][] = [];

    for (let row = 0; row < this._tiles.length; row++) {
      for (let col = 0; col < this._tiles[row].length; col++) {
        if (
          Math.abs(row - playerPosition[0]) +
            Math.abs(col - playerPosition[1]) ===
          steps
        ) {
          result.push([row, col]);
        }
      }
    }

    return result;
  }

  private highLightTiles(tileCoords: number[][]): void {
    tileCoords.forEach(
      (coords) => (this._tiles[coords[0]][coords[1]].highLight = true)
    );
  }

  private removeHighLight(): void {
    this._tiles.forEach((row) =>
      row.forEach((tile) => (tile.highLight = false))
    );
  }

  private highLightReachableSpots(
    playerPosition: number[],
    steps: number
  ): void {
    const reachableSpots = this.findReachableTiles(playerPosition, steps);

    this.highLightTiles(reachableSpots);
    this.onlyAllowClickOnHighlighted = true;
  }

  private stopGame(kill$: Subject<void>): void {
    kill$.next();
    kill$.complete();

    this.knightN.ready = false;
    this.knightE.ready = false;
    this.knightS.ready = false;
    this.knightW.ready = false;
  }

  private setRowExplosions(): void {
    for (let row = 0; row < this._tiles.length; row++) {
      this._tiles[row].forEach((tile) => {
        tile.explodingRow =
          this.knightN.target === row || this.knightS.target === row;
      });
    }

    timer(1000)
      .pipe(take(1))
      .subscribe(() => {
        this._tiles.forEach((row) =>
          row.forEach((tile) => (tile.explodingRow = false))
        );
      });
  }

  private setColExplosions(): void {
    this._tiles.forEach((row) => {
      for (let col = 0; col < row.length; col++) {
        row[col].explodingCol =
          this.knightE.target === col || this.knightW.target === col;
      }
    });

    timer(1000)
      .pipe(take(1))
      .subscribe(() => {
        this._tiles.forEach((row) =>
          row.forEach((tile) => (tile.explodingCol = false))
        );
      });
  }
}
