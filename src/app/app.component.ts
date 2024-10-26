import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BlockMapComponent } from './block-map/block-map.component';
import { BlockDetailsComponent } from './block-details/block-details.component';
import { HeaderComponent } from './header/header.component';
import { PixelLoaderModalComponent } from './components/pixel-loader-modal/pixel-loader-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BlockMapComponent,
    BlockDetailsComponent,
    HeaderComponent,
    PixelLoaderModalComponent,
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'map-dapp-view';
}
