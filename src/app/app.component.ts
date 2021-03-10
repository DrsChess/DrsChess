import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Tile } from './domain/tile';
import { takeUntil } from 'rxjs/operators';
import { Unsubscriber } from './core/unsubscriber';
import { Knight } from './domain/knight.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends Unsubscriber {
  title = 'DrsChess';

  tiles: Tile[][];

  knightW: Knight;
  knightN: Knight;
  knightE: Knight;
  knightS: Knight;

  statusText: string;
  running: boolean;
  playerMoves: number[];

  imageSrc1: string;
  imageSrc2: string;
  moveSrc1: string;
  moveSrc2: string;
  stunSrc = 'assets/Stun.png';

  debuff1Duration: number;
  debuff2Duration: number;
  stunDuration: number;

  showDebuff1 = true;
  showDebuff2 = true;
  showMove1: boolean;
  showMove2: boolean;
  showGreenSlime: boolean;

  skippable: boolean;

  speedMultiplier = 1;
  animateClass = 'drs-animate-normal';

  constructor(private appService: AppService) {
    super();
    this.appService.tiles
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((tiles) => (this.tiles = tiles));

    this.appService.knights
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((knights) => {
        this.knightW = knights[0];
        this.knightN = knights[1];
        this.knightE = knights[2];
        this.knightS = knights[3];
      });

    this.appService.playerMoves
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((moves) => this.setPlayerMoves(moves));
  }

  public startGame(): void {
    this.showMove1 = false;
    this.showMove2 = false;
    this.showGreenSlime = false;

    if (this.running) {
      return;
    }
    this.running = true;
    this.appService.startGame(this, this.speedMultiplier).subscribe(
      (v) => {
        this.skippable = v < 23;

        this.debuff1Duration =
          v <= 23 ? Math.max(0, 23 - v) : Math.max(0, 33 - v);
        this.debuff2Duration =
          v <= 38 ? Math.max(0, 38 - v) : Math.max(0, 47 - v);

        this.showDebuff1 = v <= 23;
        this.showDebuff2 = v <= 38;
        this.showMove1 = v > 23 && this.debuff1Duration > 0;
        this.showMove2 = v > 38 && this.debuff2Duration > 0;

        this.stunDuration = v >= 33 && v <= 39 ? 39 - v : -1;
      },
      () => {},
      () => {
        this.running = false;
      }
    );
  }

  public skipToFirstMechanic(): void {
    this.appService.skipToFirstMechanic();
  }

  public setStatusText(text: string): void {
    this.statusText = text;
  }

  public setSpeedMultiplier(value: any): void {
    this.speedMultiplier = +value.target.value;
    switch (this.speedMultiplier) {
      case 1:
        this.animateClass = 'drs-animate-normal';
        break;
      case 2:
        this.animateClass = 'drs-animate-fast';
        break;
      case 3:
        this.animateClass = 'drs-animate-fastest';
        break;
      default:
        this.animateClass = 'drs-animate-slow';
    }
  }

  private setPlayerMoves(playerMoves: number[]): void {
    this.playerMoves = playerMoves;
    this.debuff1Duration = 23;
    this.debuff2Duration = 38;

    if (playerMoves != null && playerMoves.length === 2) {
      this.imageSrc1 = `assets/Debuff${playerMoves[0]}.png`;
      this.imageSrc2 = `assets/Debuff${playerMoves[1]}.png`;
      this.moveSrc1 = `assets/Move${playerMoves[0]}.png`;
      this.moveSrc2 = `assets/Move${playerMoves[1]}.png`;
      this.showDebuff1 = true;
      this.showDebuff2 = true;
    } else {
      this.imageSrc1 = '';
      this.imageSrc2 = '';
    }
  }
}
