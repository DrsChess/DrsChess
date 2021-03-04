export class Tile {
  public static readonly Size = 142;
  public static readonly SizePx = '142px';

  public color: string;
  public explodingRow = false;
  public explodingCol = false;

  constructor(public readonly row: number, public readonly col: number) {
    const evenRow = this.row % 2 === 0;
    const evenCol = this.col % 2 === 0;

    this.color =
      this.row === 4 && this.col === 2
        ? 'aqua'
        : this.xor(evenRow, evenCol)
        ? 'black'
        : 'white';
  }

  private xor(foo: boolean, bar: boolean): boolean {
    return foo ? !bar : bar;
  }
}
