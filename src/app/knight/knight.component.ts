import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Knight } from '../domain/knight.model';

@Component({
  selector: 'drs-knight',
  styleUrls: ['./knight.component.scss'],
  templateUrl: 'knight.component.html',
})
export class KnightComponent {
  @Input() knight: Knight;

  imageUrl = `${environment.assets}/Knight.PNG`;
}
