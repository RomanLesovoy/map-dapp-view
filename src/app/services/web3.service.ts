import { Injectable } from '@angular/core';
import { BrowserProvider, Signer } from 'ethers';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private userAddress$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public userAddressObservable$ = this.userAddress$.asObservable();

  constructor() {
    this.initializeProvider();
  }

  public isEthereumAvailable(): boolean {
    return typeof window.ethereum !== 'undefined';
  }

  public getSigner(): Signer | null {
    return this.signer;
  }

  private async initializeProvider() {
    if (this.isEthereumAvailable()) {
      this.provider = new BrowserProvider(window.ethereum);
      await this.tryConnectWithStoredAddress();
    }
  }

  async connectWallet(): Promise<void> {
    if (!this.provider) {
      throw new Error('Ethereum provider not available');
    }

    try {
      console.log('connectWallet');
      const accounts = await this.provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        this.signer = await this.provider.getSigner();
        const address = await this.signer.getAddress();
        this.setUserAddress(address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  private async tryConnectWithStoredAddress() {
    const storedAddress = localStorage.getItem('userAddress');
    if (storedAddress) {
      try {
        console.log('tryConnectWithStoredAddress');
        const accounts = await this.provider!.listAccounts();
        const matchingAccount = accounts.find(account => account.address.toLowerCase() === storedAddress.toLowerCase());
        if (matchingAccount) {
          this.signer = await this.provider!.getSigner(storedAddress);
          this.userAddress$.next(storedAddress);
        } else {
          // Stored address is no longer available, clear it
          this.clearUserAddress();
        }
      } catch (error) {
        console.error('Error reconnecting with stored address:', error);
        this.clearUserAddress();
      }
    }
  }

  public disconnectWallet(): void {
    this.clearUserAddress();
  }

  public isConnected(): boolean {
    return this.getCurrentAddress() !== null;
  }

  public getCurrentAddress(): string | null {
    return this.userAddress$.value;
  }

  private setUserAddress(address: string) {
    localStorage.setItem('userAddress', address);
    this.userAddress$.next(address);
  }

  private clearUserAddress() {
    localStorage.removeItem('userAddress');
    this.userAddress$.next(null);
    this.signer = null;
  }
}
