import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BlockMapComponent } from './block-map/block-map.component';
import { BlockDetailsComponent } from './block-details/block-details.component';
import { HeaderComponent } from './header/header.component';
import { PixelLoaderModalComponent } from './components/pixel-loader-modal/pixel-loader-modal.component';
import { EthereumNotAvailableComponent } from './components/ethereum-not-available.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BlockMapComponent,
    BlockDetailsComponent,
    HeaderComponent,
    PixelLoaderModalComponent,
    EthereumNotAvailableComponent,
  ],
  providers: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'map-dapp-view';
  isMetamaskAvailable = false;

  constructor() {
    this.isMetamaskAvailable = !!window.ethereum;
  }
}
