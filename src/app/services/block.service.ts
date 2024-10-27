import { Injectable } from '@angular/core';
import { EventEmitterSingleton } from '@js-emitter/event-emitter-light';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { BlockInfo, ContractService } from './contract.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  public rowAmount = 100;
  public allSize = this.rowAmount * this.rowAmount;
  private blocksSubject = new BehaviorSubject<BlockInfo[]>([]);
  public blocks$ = this.blocksSubject.asObservable();
  private selectedBlockSubject = new BehaviorSubject<BlockInfo | null>(null);
  public selectedBlock$ = this.selectedBlockSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

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

  private setBlocks(blocks: BlockInfo[]) {
    this.blocksSubject.next(blocks);
  }

  public replaceBlock(block: BlockInfo) {
    const blocks = this.blocksSubject.getValue();
    blocks[Number(block.id)] = block;
    this.setBlocks(blocks);
  }

  async loadBlocks() {
    this.isLoadingSubject.next(true);
    const batchSize = 500; // batch size
    const requests = [];
  
    // Create allSize / batchSize requests
    for (let i = 0; i < this.allSize; i += batchSize) {
      const endIndex = Math.min(i + batchSize - 1, this.allSize - 1);
      requests.push(this.contractService.getAllBlocksInfo(i, endIndex));
    }
  
    // Send all requests in parallel
    forkJoin(requests).subscribe({
      next: (results: BlockInfo[][]) => {
        const allBlocks = results.flat();
        this.setBlocks(allBlocks);
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loading blocks:', error);
        this.isLoadingSubject.next(false);
      }
    });
  }
}
