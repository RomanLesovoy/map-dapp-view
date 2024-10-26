import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Web3Service } from './web3.service';
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
  private readonly apiUrl = `${environment.apiUrl}/blocks`; // Default API Path
  private readonly contractAddress = environment.contractAddress;
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoading.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly web3Service: Web3Service
  ) {}

  getBlockInfo(blockId: number): Observable<BlockInfo> {
    this.isLoading.next(true);
    return this.http.get<BlockInfo>(`${this.apiUrl}/${blockId}`)
      .pipe(finalize(() => this.isLoading.next(false)));
  }

  setBlockColor(blockId: number, color: number): Observable<{ success: boolean, message: string }> {
    this.isLoading.next(true);
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/color`, { color })
      .pipe(finalize(() => this.isLoading.next(false)));
  }

  async setBlockColorDirectly(blockId: number, color: number) {
    this.isLoading.next(true);
    this.http.post(`${this.apiUrl}/${blockId}/color-transaction`, { color }).subscribe({
      next: async (res: any) => {
        const { data } = res;
        await this.sendTransaction(data);
        this.updateBlockInfoCache(Number(blockId));
        this.isLoading.next(false);
      },
      error: (e) => {
        console.error(e);
        this.isLoading.next(false);
      }
    });
  }

  setBlockPrice(blockId: number, price: number): Observable<{ success: boolean, message: string }> {
    this.isLoading.next(true);
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/price`, { price })
      .pipe(finalize(() => this.isLoading.next(false)));
  }

  getAllBlocksInfo(startId: number, endId: number): Observable<BlockInfo[]> {
    this.isLoading.next(true);
    return this.http.get<BlockInfo[]>(`${this.apiUrl}`, {
      params: { startId: startId.toString(), endId: endId.toString() }
    }).pipe(finalize(() => this.isLoading.next(false)));
  }

  async setBlockPriceDirectly(blockId: number, price: number) {
    this.isLoading.next(true);
    this.http.post(`${this.apiUrl}/${blockId}/price-transaction`, { price }).subscribe({
      next: async (res: any) => {
        const { data } = res;
        await this.sendTransaction(data);
        this.updateBlockInfoCache(Number(blockId));
        this.isLoading.next(false);
      },
      error: (e) => {
        console.error(e);
        this.isLoading.next(false);
      }
    });
  }

  buyBlock(blockId: number): Observable<{ success: boolean, message: string }> {
    this.isLoading.next(true);
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/buy`, {})
      .pipe(finalize(() => this.isLoading.next(false)));
  }

  async buyBlockDirectly(block: BlockInfo) {
    this.isLoading.next(true);
    this.http.post(`${this.apiUrl}/${block.id}/buy-transaction`, {}).subscribe({
      next: async (res: any) => {
        const { data } = res;
        await this.sendTransaction(data, block.priceWei);
        this.updateBlockInfoCache(Number(block.id));
        this.isLoading.next(false);
      },
      error: (e) => {
        console.error(e);
        this.isLoading.next(false);
      }
    });
  }

  private updateBlockInfoCache(blockId: number) {
    this.http.get(`${this.apiUrl}/${blockId}/cache`).subscribe();
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
