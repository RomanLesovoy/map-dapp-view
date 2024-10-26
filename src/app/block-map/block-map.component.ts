import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockService } from '../services/block.service';
import { Web3Service } from '../services/web3.service';
import { BlockInfo } from '../services/contract.service';
import { ColorPipe } from '../pipes/color.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, ColorPipe],
  selector: 'app-block-map',
  templateUrl: './block-map.component.html',
  styleUrls: ['./block-map.component.scss']
})
export class BlockMapComponent implements OnInit {
  blocks: BlockInfo[][] = [];

  constructor(
    private readonly blockService: BlockService,
    private readonly web3Service: Web3Service
  ) {}

  async ngOnInit() {
    this.blockService.blocks$.subscribe((blocks) => {
      this.blocks = blocks;
    });
  }

  checkIsSelected(block: any) {
    return this.blockService.getSelectedBlock()?.id === block.id;
  }

  checkIsOwned(block: any) {
    return block.owner === this.web3Service.getCurrentAddress();
  }

  onBlockClick(block: any) {
    this.blockService.setSelectedBlock(block);
  }
}
