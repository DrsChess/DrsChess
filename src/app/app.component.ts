import { Component } from '@angular/core';
import { Tile } from './domain/tile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DrsChess';

  tiles: Tile[][] = [];

  constructor() {
    this.resetBoard();
  }

  private resetBoard(): void {
    this.tiles = [];
    for (let row = 0; row < 5; row++) {
      this.tiles.push([]);
      for (let col = 0; col < 5; col++) {
        this.tiles[row].push(new Tile(row, col));
      }
    }
  }
}
