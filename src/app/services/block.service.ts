import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BlockInfo, ContractService } from './contract.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private blocksSubject = new BehaviorSubject<BlockInfo[][]>([]);
  blocks$ = this.blocksSubject.asObservable();
  private selectedBlockSubject = new BehaviorSubject<BlockInfo | null>(null);
  selectedBlock$ = this.selectedBlockSubject.asObservable();

  constructor(
    private readonly contractService: ContractService,
    private readonly authService: AuthService
  ) {
    this.authService.isAuthenticated$.subscribe((isAuthenticated: boolean) => {
      isAuthenticated && !this.blocksSubject.getValue().length && this.loadBlocks();
    });
  }

  setSelectedBlock(block: BlockInfo) {
    this.selectedBlockSubject.next(block);
  }

  clearSelectedBlock() {
    this.selectedBlockSubject.next(null);
  }

  getSelectedBlock() {
    return this.selectedBlockSubject.getValue();
  }

  private setBlocks(blocks: BlockInfo[][]) {
    this.blocksSubject.next(blocks);
  }

  async loadBlocks() {
    const allSize = 200; // 10000; // todo
    const blocksPerPage = 100;
    for (let i = 0; i < allSize; i += blocksPerPage) {
      const blocksInfo: BlockInfo[] = await firstValueFrom(this.contractService.getAllBlocksInfo(i, i + blocksPerPage - 1));
      this.setBlocks([
        ...this.blocksSubject.getValue(),
        ...this.chunkArray(blocksInfo, 100),
      ]);
    }
  }

  private chunkArray(array: BlockInfo[], size: number): BlockInfo[][] {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }
}
