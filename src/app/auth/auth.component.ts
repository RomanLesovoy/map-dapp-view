import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '../services/web3.service';
import { AddressPipe } from '../pipes/address.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, AddressPipe],
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isConnected: boolean = false;
  currentAddress: string | null = null;

  constructor(
    public readonly web3Service: Web3Service,
  ) {
    this.web3Service.userAddressObservable$.subscribe((address) => {
      this.isConnected = !!address;
      this.currentAddress = address
    });
  }

  connectWallet() {
    if (this.web3Service.isEthereumAvailable()) {
      this.web3Service.connectWallet();
    } else {
      console.error('Ethereum wallet not found');
      // todo show modal
    }
  }

  disconnectWallet() {
    this.web3Service.disconnect$.next(true);
  }
}
