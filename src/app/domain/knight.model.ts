import { TileComponent } from '../tile/tile.component';
import { Direction } from './direction.enum';
import { Position } from './position.model';

export class Knight {
  public static knightPositions: Map<Direction, Position[]> = new Map([
    [
      Direction.W,
      [
        new Position(0 * TileComponent.Size - 100, 3 * TileComponent.Size + 50),
        new Position(5 * TileComponent.Size + 2, 3 * TileComponent.Size + 50),
      ],
    ],
    [
      Direction.N,
      [
        new Position(3 * TileComponent.Size + 32, 0 * TileComponent.Size - 63),
        new Position(3 * TileComponent.Size + 32, 5 * TileComponent.Size + 3),
      ],
    ],
    [
      Direction.E,
      [
        new Position(0 * TileComponent.Size - 100, TileComponent.Size + 50),
        new Position(5 * TileComponent.Size + 2, TileComponent.Size + 50),
      ],
    ],
    [
      Direction.S,
      [
        new Position(TileComponent.Size + 32, 0 * TileComponent.Size - 63),
        new Position(TileComponent.Size + 32, 5 * TileComponent.Size + 3),
      ],
    ],
  ]);

  public steps: number;
  public ready: boolean;
  public position: Position;

  constructor(public readonly facing: Direction) {}

  public init(index: number, steps: number): void {
    // tslint:disable-next-line: no-non-null-assertion
    this.position = Knight.knightPositions.get(this.facing)![index];
    this.steps = steps;

    this.ready = true;
  }

  public move(): void {
    switch (this.facing) {
      case Direction.N:
        this.position.top -= this.steps * TileComponent.Size;
        break;
      case Direction.E:
        this.position.left += this.steps * TileComponent.Size;
        break;
      case Direction.S:
        this.position.top += this.steps * TileComponent.Size;
        break;
      case Direction.W:
        this.position.left -= this.steps * TileComponent.Size;
        break;
    }
  }
}
