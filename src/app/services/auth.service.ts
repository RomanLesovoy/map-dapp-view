import { DestroyRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, distinctUntilChanged, of, switchMap, map, from, Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authToken$ = new BehaviorSubject<string | null>(null);
  private keyTokey = 'authToken';
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  private isLoading$ = new BehaviorSubject<boolean>(false);
  public isLoadingObservable$ = this.isLoading$.asObservable();
  public authTokenObservable$ = this.authToken$.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable().pipe(distinctUntilChanged());

  constructor(
    private readonly http: HttpClient,
    private readonly web3Service: Web3Service,
    private readonly destroy$: DestroyRef,
  ) {
    this.web3Service.disconnect$.pipe(
      takeUntilDestroyed(this.destroy$),
      tap(() => this.clearAuthState())
    ).subscribe();

    this.web3Service.userAddressObservable$.pipe(
      takeUntilDestroyed(this.destroy$),
      switchMap((address: string | null) => {
        this.isLoading$.next(true);
        const token = this.getAuthToken();
        const tokenValid = token && !this.isTokenExpired(token);

        if (!!address && tokenValid) { // storage has address & token valid
          return this.verifyToken(token);
        } else if (!!address && !tokenValid) { // web3 is connected but no valid token
          return this.authenticateToApiWithAddress();
        }
        return of(this.web3Service.notAuthenticated);
      }),
    ).subscribe({
      next: ({ address, token }) => {
        this.isLoading$.next(false);
        address && token && this.setAuthState(token)
      },
      error: (error) => {
        this.isLoading$.next(false);
        this.onAuthError(error)
      },
    });
  }

  public isTokenExpired(token: string): boolean {
    if (!token) return true;
    const decodedToken = jwtDecode(token)!;
    const expirationDate = new Date(Number(decodedToken.exp) * 1000);
    return expirationDate < new Date();
  }

  private onAuthError(error: any) {
    console.error('Error authenticating', error);
    this.clearAuthState();
    this.web3Service.disconnect$.next(true);
  }

  private authenticateToApiWithAddress(): Observable<{ address: string | null, token: string | null }> {
    const address = this.web3Service.getCurrentAddress(); 
    const timestamp = Date.now();
    return from(this.web3Service.signMessage(`Authenticate for Block Trading App: ${timestamp}`)).pipe(
      switchMap((signature) => this.http.post<{ token: string }>(`${environment.apiUrl}/auth`, {
        address,
        timestamp,
        signature
      })),
      map(({ token }) => token ? { address, token } : this.web3Service.notAuthenticated),
      catchError((error) => {
        this.onAuthError(error);
        return of(this.web3Service.notAuthenticated);
      })
    );
  }

  private verifyToken(token: string): Observable<{ address: string | null, token: string | null }> {
    return this.http.post<{ address: string }>(`${environment.apiUrl}/auth/verify`, { token }).pipe(
      map(({ address }) => address ? { address, token } : this.web3Service.notAuthenticated),
      catchError((error) => {
        this.onAuthError(error);
        return of(this.web3Service.notAuthenticated);
      })
    );
  }

  private setAuthState(authToken: string) {
    this.authToken$.next(authToken)
    localStorage.setItem(this.keyTokey, authToken);
    this.isAuthenticatedSubject$.next(true);
  }

  private clearAuthState() {
    this.authToken$.next(null);
    localStorage.removeItem(this.keyTokey);
    this.isAuthenticatedSubject$.next(false);
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(this.keyTokey);
  }
}
