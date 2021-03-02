import { Component, Input } from '@angular/core';
import { Knight } from '../domain/knight.model';

@Component({
  selector: 'drs-knight',
  styleUrls: ['./knight.component.scss'],
  templateUrl: 'knight.component.html',
})
export class KnightComponent {
  @Input() knight: Knight;
}
