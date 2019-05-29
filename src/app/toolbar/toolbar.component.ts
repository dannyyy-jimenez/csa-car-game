import { Component } from '@angular/core';
import * as screenfull from "screenfull";
import {Screenfull} from "screenfull";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent{
  fullscreen = false;

  constructor() { }

  onFullScreen() {
    let sf = <Screenfull>screenfull;
    if (sf.enabled) {
      sf.request();
    }
    sf.on('change', () => {
      this.fullscreen = sf.isFullscreen;
    })
  }
}
