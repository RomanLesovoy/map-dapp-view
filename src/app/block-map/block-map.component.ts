import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ContractService } from '../services/contract.service';
import { BlockService } from '../services/block.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-block-map',
  templateUrl: './block-map.component.html',
  styleUrls: ['./block-map.component.scss']
})
export class BlockMapComponent implements OnInit {
  blocks: any[][] = [];

  constructor(
    private contractService: ContractService,
    private blockService: BlockService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      isAuthenticated && this.loadBlocks();
    });
  }

  async loadBlocks() {
    const blocksPerPage = 100;
    for (let i = 0; i < 10000; i += blocksPerPage) {
      const blocksInfo = await firstValueFrom(this.contractService.getAllBlocksInfo(i, i + blocksPerPage - 1));
      this.blocks.push(...this.chunkArray(blocksInfo, 100));
    }
  }

  private chunkArray(array: any[], size: number) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }

  onBlockClick(block: any) {
    // this.contractService.getBlockInfo(blockId).subscribe(
    //   (blockInfo: BlockInfo) => {
    //     this.blockService.setSelectedBlock(blockInfo);
    //   },
    //   error => {
    //     console.error('Error fetching block info:', error);
    //   }
    // )
    this.blockService.setSelectedBlock(block);
  }

  getBlockColor(block: any) {
    return `rgb(${block.color * 16}, ${block.color * 16}, ${block.color * 16})`;
  }
}
