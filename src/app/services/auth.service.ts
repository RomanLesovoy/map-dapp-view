import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authToken$ = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public authTokenObservable$ = this.authToken$.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  constructor(
    private http: HttpClient,
    private web3Service: Web3Service
  ) {
    this.web3Service.userAddressObservable$
    .pipe(
      filter(address => !!address)
    ).subscribe(_isConnected => this.authenticateToApi());
  }

  public async authenticateToApi(): Promise<string | null> {
    try {
      const timestamp = Date.now();
      const message = `Authenticate for Block Trading App: ${timestamp}`;
      const signature = await this.web3Service.getSigner()!.signMessage(message);

      const response = await firstValueFrom(
        this.http.post<{ token: string }>(`${environment.apiUrl}/auth`, {
          address: this.web3Service.getCurrentAddress(),
          timestamp,
          signature
        })
      );

      if (response && response.token) {
        this.setAuthState(response.token);
        return response.token;
      } else {
        throw new Error('Authentication failed: No token received');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private setAuthState(authToken: string) {
    this.authToken$.next(authToken)
    localStorage.setItem('authToken', authToken);
    this.isAuthenticatedSubject$.next(true);
  }

  // private async requestAccounts(): Promise<void> {
  //   await window.ethereum.request({ method: 'eth_requestAccounts' });
  // }
}
