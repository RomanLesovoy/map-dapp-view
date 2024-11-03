import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Web3Service } from './web3.service';
import { EventEmitterSingleton } from '@js-emitter/event-emitter-light';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BlockInfo {
  owner: string;
  color: number;
  price: string;
  id: string;
  priceWei: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private readonly apiUrl = `${environment.apiUrl}/blocks`;
  private readonly contractAddress = environment.contractAddress;
  private isLoading$ = new BehaviorSubject<boolean>(false);
  public isLoadingObservable$ = this.isLoading$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly web3Service: Web3Service,
  ) {}

  getBlockInfo(blockId: number): Observable<BlockInfo> {
    this.isLoading$.next(true);
    return this.http.get<BlockInfo>(`${this.apiUrl}/${blockId}`)
      .pipe(finalize(() => this.isLoading$.next(false)));
  }

  async setBlockColorDirectly(blockId: number, color: number) {
    this.isLoading$.next(true);
    this.http.post(`${this.apiUrl}/${blockId}/color-transaction`, { color }).subscribe({
      next: async (res: any) => {
        const { data } = res;
        await this.sendTransaction(data);
        this.updateBlockInfoCache(Number(blockId));
        this.isLoading$.next(false);
      },
      error: (e) => {
        console.error(e);
        this.isLoading$.next(false);
      }
    });
  }

  getAllBlocksInfo(startId: number, endId: number): Observable<{ blocks: BlockInfo[] }> {
    const withQueue = true;

    this.isLoading$.next(true);
    return this.http.get<{ blocks: BlockInfo[] }>(`${this.apiUrl}${withQueue ? '/queue' : ''}`, {
      params: { startId: startId.toString(), endId: endId.toString() }
    }).pipe(finalize(() => this.isLoading$.next(false)));
  }

  async setBlockPriceDirectly(blockId: number, price: number) {
    this.isLoading$.next(true);
    this.http.post(`${this.apiUrl}/${blockId}/price-transaction`, { price }).subscribe({
      next: async (res: any) => {
        const { data } = res;
        await this.sendTransaction(data);
        this.updateBlockInfoCache(Number(blockId));
        this.isLoading$.next(false);
      },
      error: (e) => {
        console.error(e);
        this.isLoading$.next(false);
      }
    });
  }

  async buyBlockDirectly(block: BlockInfo) {
    this.isLoading$.next(true);
    this.http.post(`${this.apiUrl}/${block.id}/buy-transaction`, {}).subscribe({
      next: async (res: any) => {
        const { data } = res;
        await this.sendTransaction(data, block.priceWei);
        this.updateBlockInfoCache(Number(block.id));
        this.isLoading$.next(false);
      },
      error: (e) => {
        console.error(e);
        this.isLoading$.next(false);
      }
    });
  }

  private updateBlockInfoCache(blockId: number) {
    this.http.post<BlockInfo>(`${this.apiUrl}/${blockId}/cache`, {}).subscribe({
      next: (block: BlockInfo) => block.id && new EventEmitterSingleton().emit('block-cache-updated', block),
      error: (e) => console.error(e),
    });
  }

  private async sendTransaction(data: string, value?: string) {
    const signer = await this.web3Service.getSigner();
    const tx = await signer!.sendTransaction({
      to: this.contractAddress,
      data: data,
      gasLimit: 1000000,
      value: value || undefined,
    });

    await tx.wait();
  }
}
