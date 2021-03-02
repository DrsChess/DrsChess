import { interval, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { Direction } from './direction.enum';
import { Position } from './position.model';
import { Tile } from './tile';

export class Knight {
  public static knightPositions: Map<Direction, Position[]> = new Map([
    [
      Direction.W,
      [
        new Position(0 * Tile.Size - 100, 3 * Tile.Size + 50),
        new Position(5 * Tile.Size + 2, 3 * Tile.Size + 50),
      ],
    ],
    [
      Direction.N,
      [
        new Position(3 * Tile.Size + 32, 0 * Tile.Size - 63),
        new Position(3 * Tile.Size + 32, 5 * Tile.Size + 3),
      ],
    ],
    [
      Direction.E,
      [
        new Position(0 * Tile.Size - 100, Tile.Size + 50),
        new Position(5 * Tile.Size + 2, Tile.Size + 50),
      ],
    ],
    [
      Direction.S,
      [
        new Position(Tile.Size + 32, 0 * Tile.Size - 63),
        new Position(Tile.Size + 32, 5 * Tile.Size + 3),
      ],
    ],
  ]);

  public steps: number;
  public displayedSteps: number;
  public ready: boolean;
  public position: Position;

  get target(): number {
    switch (this.facing) {
      case Direction.W:
      case Direction.N:
        return 3 - this.steps;
      case Direction.E:
      case Direction.S:
        return 1 + this.steps;
    }
  }

  constructor(public readonly facing: Direction) {}

  public init(index: number, steps: number): void {
    // tslint:disable-next-line: no-non-null-assertion
    const pos = Knight.knightPositions.get(this.facing)![index];

    this.position = new Position(pos.top, pos.left);
    this.steps = steps;
    this.displayedSteps = steps;

    this.ready = true;
  }

  public move(): void {
    switch (this.facing) {
      case Direction.N:
        this.position.top -= this.steps * Tile.Size;
        break;
      case Direction.E:
        this.position.left += this.steps * Tile.Size;
        break;
      case Direction.S:
        this.position.top += this.steps * Tile.Size;
        break;
      case Direction.W:
        this.position.left -= this.steps * Tile.Size;
        break;
    }

    interval(1500 / this.steps)
      .pipe(take(this.steps))
      .subscribe(
        () => {
          this.displayedSteps -= 1;
        },
        () => {},
        () =>
          timer(1500)
            .pipe(take(1))
            .subscribe(() => (this.ready = false))
      );
  }
}
