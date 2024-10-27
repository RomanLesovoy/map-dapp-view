import { Injectable } from '@angular/core';
import { EventEmitterSingleton } from '@js-emitter/event-emitter-light';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BlockInfo, ContractService } from './contract.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private rowAmount = 100;
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
    new EventEmitterSingleton().subscribe({
      on: 'block-cache-updated',
      next: (block: BlockInfo) => {
        block.id && this.replaceBlock(block);
      }
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

  public replaceBlock(block: BlockInfo) {
    const blocks = this.blocksSubject.getValue();
    const row = Math.floor(Number(block.id) / this.rowAmount);
    const col = Number(block.id) % this.rowAmount;
    blocks[row][col] = block;
    this.setBlocks(blocks);
  }

  async loadBlocks() {
    const allSize = this.rowAmount * this.rowAmount;
    for (let i = 0; i < allSize; i += this.rowAmount) {
      const blocksInfo: BlockInfo[] = await firstValueFrom(this.contractService.getAllBlocksInfo(i, i + this.rowAmount - 1));
      this.setBlocks([
        ...this.blocksSubject.getValue(),
        ...this.chunkArray(blocksInfo, this.rowAmount),
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
