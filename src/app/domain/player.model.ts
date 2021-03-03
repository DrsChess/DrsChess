import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Coords } from './coords.model';

export class Player {
  public steps: number;
  public failed: boolean;
  public remainingSteps: number;

  private position$: ReplaySubject<Coords> = new ReplaySubject<Coords>(1);
  private startingPos$: ReplaySubject<Coords> = new ReplaySubject<Coords>(1);

  get playerPosition(): Observable<Coords> {
    return this.position$.asObservable();
  }

  get startingPosition(): Observable<Coords> {
    return this.startingPos$.asObservable();
  }

  constructor() {
    combineLatest([this.position$, this.startingPos$]).subscribe((data) => {
      const startingRow = data[1].row;
      const startingCol = data[1].col;

      const row = data[0].row;
      const col = data[0].col;

      if (startingRow < 0 || startingCol < 0) {
        this.remainingSteps = 0;
        return;
      }

      const distanceToStartingPosition =
        Math.abs(row - startingRow) + Math.abs(col - startingCol);

      this.remainingSteps = this.steps - distanceToStartingPosition;
    });
  }

  public setPlayerPosition(row: number, col: number): void {
    this.position$.next(new Coords(row, col));
  }

  public setStartingPosition(row: number, col: number): void {
    this.startingPos$.next(new Coords(row, col));
  }

  public move(code: string): void {
    this.position$.pipe(take(1)).subscribe((pos) => {
      switch (code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.setPlayerPosition(pos.row, Math.max(0, pos.col - 1));
          break;

        case 'ArrowUp':
        case 'KeyW':
          this.setPlayerPosition(Math.max(0, pos.row - 1), pos.col);
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.setPlayerPosition(pos.row, Math.min(4, pos.col + 1));
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.setPlayerPosition(Math.min(4, pos.row + 1), pos.col);
          break;
      }
    });
  }
}
