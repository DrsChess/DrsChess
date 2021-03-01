export class Tile {
  public color: string;
  public hasPlayer = false;

  constructor(private row: number, private col: number) {
    this.updateValues();
  }

  public updateValues(): void {
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
