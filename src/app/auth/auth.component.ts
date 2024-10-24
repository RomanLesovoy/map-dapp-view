import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '../services/web3.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  constructor(public web3Service: Web3Service) {}

  connectWallet() {
    if (this.web3Service.isEthereumAvailable()) {
      this.web3Service.connectWallet();
    } else {
      console.error('Ethereum wallet not found');
      // todo show modal
    }
  }

  disconnectWallet() {
    this.web3Service.disconnectWallet();
  }
}
