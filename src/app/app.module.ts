import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { KnightComponent } from './knight/knight.component';
import { TileComponent } from './tile/tile.component';

@NgModule({
  declarations: [AppComponent, TileComponent, KnightComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
