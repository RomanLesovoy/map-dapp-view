import { Component, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from '../services/web3.service';
import { AddressPipe } from '../pipes/address.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    private readonly web3Service: Web3Service,
    private readonly destroy$: DestroyRef,
  ) {
    this.web3Service.userAddressObservable$
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe((address) => {
        this.isConnected = !!address;
        this.currentAddress = address
      });
  }

  connectWallet() {
    this.web3Service.connectWallet();
  }

  copyAddress() {
    navigator.clipboard.writeText(this.currentAddress!);
  }

  disconnectWallet() {
    this.web3Service.disconnect$.next(true);
  }
}
