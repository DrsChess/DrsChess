import { Injectable } from '@angular/core';
import {
  fromEvent,
  interval,
  Observable,
  of,
  ReplaySubject,
  Subject,
  timer,
} from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { AppComponent } from './app.component';
import { Unsubscriber } from './core/unsubscriber';
import { Coords } from './domain/coords.model';
import { Direction } from './domain/direction.enum';
import { Knight } from './domain/knight.model';
import { Player } from './domain/player.model';
import { Tile } from './domain/tile';

@Injectable({
  providedIn: 'root',
})
export class AppService extends Unsubscriber {
  private _tiles: Tile[][];
  private tiles$: ReplaySubject<Tile[][]>;
  private knights$: ReplaySubject<Knight[]>;
  private player$: ReplaySubject<Player>;
  private playerMoves$: ReplaySubject<number[]>;

  private knightW: Knight;
  private knightN: Knight;
  private knightE: Knight;
  private knightS: Knight;

  private playerMoveAllowed: boolean;
  private _playerMoves: number[];

  private readonly _player: Player;
  private playerPosition: Coords;
  private playerStartingPosition: Coords;

  get tiles(): Observable<Tile[][]> {
    return this.tiles$.asObservable();
  }

  get knights(): Observable<Knight[]> {
    return this.knights$.asObservable();
  }

  get player(): Observable<Player> {
    return this.player$.asObservable();
  }

  get playerMoves(): Observable<number[]> {
    return this.playerMoves$.asObservable();
  }

  constructor() {
    super();
    this.tiles$ = new ReplaySubject<Tile[][]>(1);
    this.knights$ = new ReplaySubject<Knight[]>(1);
    this.player$ = new ReplaySubject<Player>(1);
    this.playerMoves$ = new ReplaySubject<number[]>(1);

    this._player = new Player();
    this._player.setPlayerPosition(4, 2);
    this._player.setStartingPosition(-1, -1);

    this._player.playerPosition
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((pos) => (this.playerPosition = pos));
    this._player.startingPosition
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((pos) => (this.playerStartingPosition = pos));

    fromEvent(document, 'keydown')
      .pipe(filter((event: any) => !event.repeat))
      .subscribe((event) => {
        if (this.playerMoveAllowed) {
          this._player.move(event.code);
        }
      });

    this.player$.next(this._player);

    this.resetBoard();
  }

  public onClick(tile: Tile) {
    if (!this.playerMoveAllowed) {
      return;
    }

    this._player.setPlayerPosition(tile.row, tile.col);
  }

  public startGame(component: AppComponent): Observable<number> {
    this.playerMoveAllowed = false;

    this.resetBoard();
    this.setupGame();

    const kill$ = new Subject<void>();

    const start = 23;
    this.playerMoveAllowed = true;

    return interval(1000).pipe(
      take(48),
      takeUntil(kill$),
      tap((v) => {
        // Time before the first debuff ends (23 seconds)
        if (v < start) {
          component.setStatusText(
            `Find your starting position! Seconds left: ${start - v}`
          );
        }
        // The first knights move
        if (v === start - 2) {
          if (this.playerPosition.row === 4 && this.playerPosition.col === 2) {
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

        // Time to move the first steps (10 seconds)
        if (v >= start && v < start + 10) {
          // The rows explode
          if (v === start) {
            this.setRowExplosions();

            if (this.playerPosition.row === this.knightS.target) {
              component.setStatusText(
                `Explosion: The row you are on was hit by the knight walking south!! DOOOM`
              );
              this.stopGame(kill$);
              return;
            }
            if (this.playerPosition.row === this.knightN.target) {
              component.setStatusText(
                `Explosion: The row you are on was hit by the knight walking north!! DOOOM`
              );
              this.stopGame(kill$);
              return;
            }

            component.setStatusText(`Explosion! You are safe!`);

            this._player.steps = this._playerMoves[0];
            this._player.setStartingPosition(
              this.playerPosition.row,
              this.playerPosition.col
            );
          }

          component.setStatusText(
            `Move your first amount of steps (${
              this._playerMoves[0]
            })! Seconds left: ${10 + (start - v)}`
          );
          return;
        }
        // The second knights move
        if (v === start + 10) {
          this.playerMoveAllowed = false;

          if (this._player.remainingSteps !== 0) {
            component.setStatusText(
              `You did not move the required amount of steps! DOOOOOOM!!!`
            );
            this.stopGame(kill$);
            return;
          }

          this._player.steps = 0;
          this._player.setStartingPosition(-1, -1);

          component.setStatusText(`Moving East and West`);
          this.knightE.move();
          this.knightW.move();
          return;
        }
        // The columns explode
        if (v === start + 12) {
          this.setColExplosions();

          if (this.playerPosition.col === this.knightE.target) {
            component.setStatusText(
              `Explosion: The column you are on was hit by the knight walking east!! DOOOM`
            );
            this.stopGame(kill$);
            return;
          }
          if (this.playerPosition.col === this.knightW.target) {
            component.setStatusText(
              `Explosion: The column you are on was hit by the knight walking west!! DOOOM`
            );
            this.stopGame(kill$);
            return;
          }

          component.setStatusText(`Explosion! You are safe!`);
          return;
        }
        // Time to move the second steps (9 seconds)
        if (v >= start + 16 && v < start + 24) {
          this.playerMoveAllowed = true;

          if (v === start + 16) {
            this._player.steps = this._playerMoves[1];
            this._player.setStartingPosition(
              this.playerPosition.row,
              this.playerPosition.col
            );
          }

          component.setStatusText(
            `Move your second amount of steps (${
              this._playerMoves[1]
            })! Seconds left: ${8 + (start + 16 - v)}`
          );
          return;
        }
        if (v === start + 24) {
          this.playerMoveAllowed = false;

          if (this._player.remainingSteps !== 0) {
            component.setStatusText(
              `You did not move the required amount of steps! DOOOOOOM!!!`
            );
            this.stopGame(kill$);
            return;
          }

          this._player.steps = 0;
          this._player.setStartingPosition(-1, -1);

          if (this.playerPosition.col !== 2 || this.playerPosition.row !== 4) {
            component.setStatusText(
              `You did not reach the target tile. DOOOOOM`
            );
            this.stopGame(kill$);
          } else {
            component.setStatusText(
              `You reached the goal in time without getting hit. Good job!`
            );
            component.showGreenSlime = true;
          }
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

    this._playerMoves = this.generate2DifferentRandomNumbers(2, 4);
    this.playerMoves$.next(this._playerMoves);

    this._player.setPlayerPosition(4, 2);
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
    this._player.failed = false;

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

    this._player.setStartingPosition(-1, -1);

    this._player.steps = 0;

    this._tiles = tiles;
    this.tiles$.next(tiles);
  }

  private randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private stopGame(kill$: Subject<void>): void {
    kill$.next();
    kill$.complete();

    this.playerMoveAllowed = false;

    timer(1000)
      .pipe(take(1))
      .subscribe(() => {
        this.knightN.ready = false;
        this.knightE.ready = false;
        this.knightS.ready = false;
        this.knightW.ready = false;

        this._player.failed = true;
      });
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
