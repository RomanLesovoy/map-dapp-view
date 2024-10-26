import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-ethereum-not-available',
  template: `
    <div class="error-container">
      <h1>Metamask not found</h1>
      <p>Please install Metamask to use this application.</p>
    </div>
  `,
  styles: [`
    h1 {
      font-size: 20px;
      margin-bottom: 20px;
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
    }
  `]
})
export class EthereumNotAvailableComponent {}
