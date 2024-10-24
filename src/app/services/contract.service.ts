import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Web3Service } from './web3.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BlockInfo {
  owned: boolean;
  owner: string;
  color: number;
  price: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl = `${environment.apiUrl}/blocks`; // Default API Path

  constructor(private http: HttpClient, private web3Service: Web3Service) {}

  getBlockInfo(blockId: number): Observable<BlockInfo> {
    return this.http.get<BlockInfo>(`${this.apiUrl}/${blockId}`);
  }

  buyBlock(blockId: number): Observable<{ success: boolean, message: string }> {
    const buyer = this.web3Service.getCurrentAddress();
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/buy`, { buyer });
  }

  sellBlock(blockId: number, price: string): Observable<{ success: boolean, message: string }> {
    const seller = this.web3Service.getCurrentAddress();
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/sell`, { seller, price });
  }

  buyFromUser(blockId: number): Observable<{ success: boolean, message: string }> {
    const buyer = this.web3Service.getCurrentAddress();
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/buy-from-user`, { buyer });
  }

  setBlockColor(blockId: number, color: number): Observable<{ success: boolean, message: string }> {
    const owner = this.web3Service.getCurrentAddress();
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/${blockId}/color`, { color, owner });
  }

  buyMultipleBlocks(blockIds: number[]): Observable<{ success: boolean, message: string }> {
    const buyer = this.web3Service.getCurrentAddress();
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/buy-multiple`, { blockIds, buyer });
  }

  getAllBlocksInfo(startId: number, endId: number): Observable<BlockInfo[]> {
    return this.http.get<BlockInfo[]>(`${this.apiUrl}`, {
      params: { startId: startId.toString(), endId: endId.toString() }
    });
  }
}
