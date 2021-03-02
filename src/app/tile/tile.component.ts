import { Component, Input } from '@angular/core';
import { AppService } from '../app.service';
import { Tile } from '../domain/tile';

@Component({
  selector: 'drs-tile',
  styleUrls: ['./tile.component.scss'],
  templateUrl: './tile.component.html',
})
export class TileComponent {
  public static readonly Size = 152;
  public static readonly SizePx = '152px';

  @Input() tile: Tile;

  constructor(private appService: AppService) {}

  public onClick(): void {
    this.appService.onClick(this.tile);
  }
}
