import { Component, Input } from '@angular/core';

@Component({
  selector: 'drs-dots',
  templateUrl: './dots.component.html',
  styleUrls: ['./dots.component.scss'],
})
export class DotsComponent {
  @Input() dotCount: number;
}
