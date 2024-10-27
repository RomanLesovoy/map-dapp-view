import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrowserProvider, Signer } from 'ethers';
import { BehaviorSubject, distinctUntilChanged, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private storageKey = 'userAddress';
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private userAddress$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public userAddressObservable$ = this.userAddress$.asObservable().pipe(distinctUntilChanged());
  public disconnect$ = new Subject<boolean>();
  public notAuthenticated = { address: null, token: null };

  constructor(
    private readonly destroy$: DestroyRef,
  ) {
    this.provider = new BrowserProvider(window.ethereum);
    this.tryConnectWithStoredAddress();

    this.disconnect$.pipe(
      takeUntilDestroyed(this.destroy$),
      tap((disconnect: boolean) => {
        disconnect && this.disconnectWallet();
        return disconnect;
      })
    ).subscribe();
  }

  public async getSigner(): Promise<Signer | null> {
    if (!this.signer) {
      this.signer = await this.provider!.getSigner();
      const address = await this.signer.getAddress();
      this.setUserAddress(address);
    }
    return this.signer;
  }

  public async connectWallet(): Promise<void> {
    if (this.signer && this.userAddress$.value) {
      return;
    }

    try {
      const accounts = await this.provider!.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        this.getSigner();
      } else {
        throw new Error('No accounts');
      }
    } catch (error) {
      throw error;
    }
  }

  private async tryConnectWithStoredAddress() {
    const storedAddress = localStorage.getItem(this.storageKey);
    if (storedAddress) {
      try {
        const accounts = await this.provider!.listAccounts();
        const matchingAccount = accounts.find(account => account.address.toLowerCase() === storedAddress.toLowerCase());
        if (matchingAccount) {
          this.userAddress$.next(storedAddress);
        } else {
          // Stored address is no longer available, clear it
          this.disconnectWallet();
        }
      } catch (error) {
        console.error('Error reconnecting with stored address:', error);
        this.disconnectWallet();
      }
    }
  }

  public async signMessage(message: string): Promise<string> {
    try {
      return (await this.getSigner())!.signMessage(message);
    } catch (e) {
      console.error('Error signing message:', e);
      throw e;
    }
  }

  private disconnectWallet(): void {
    localStorage.removeItem(this.storageKey);
    this.userAddress$.next(null);
    this.signer = null;
  }

  public getCurrentAddress(): string | null {
    return this.userAddress$.value;
  }

  private setUserAddress(address: string) {
    localStorage.setItem(this.storageKey, address);
    this.userAddress$.next(address);
  }
}
