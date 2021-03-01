export class Tile {
  public color: string;
  public hasPlayer = false;

  constructor(public row: number, public col: number) {
    const evenRow = row % 2 === 0;
    const evenCol = col % 2 === 0;

    this.color = row === 4 && col === 2 ? 'aqua' : this.xor(evenRow, evenCol) ? 'black' : 'white';
  }

  private xor(foo: boolean, bar: boolean): boolean {
    return foo ? !bar : bar;
  }
}
