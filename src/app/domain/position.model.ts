export class Position {
  get topPx(): string {
    return this.top + 'px';
  }

  get leftPx(): string {
    return this.left + 'px';
  }

  constructor(public top: number, public left: number) {}
}
