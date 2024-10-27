import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
  blocks: BlockInfo[] = [];
  blocksRowAmount: Array<number> = [];
  blocksColAmount: Array<number> = [];
  selectedBlock: BlockInfo | null = null;
  currentUserAddress: string | null = null;
  isLoading: Observable<boolean>;

  constructor(
    private readonly blockService: BlockService,
    private readonly web3Service: Web3Service
  ) {
    this.isLoading = this.blockService.isLoading$;
  }

  async ngOnInit() {
    this.blockService.blocks$.subscribe((blocks) => {
      this.blocks = blocks;
      this.blocksRowAmount = this.blocksColAmount = Array(this.blockService.rowAmount);
    });
    this.web3Service.userAddressObservable$.subscribe((address) => {
      this.currentUserAddress = address;
    });
    this.blockService.selectedBlock$.subscribe((block) => {
      this.selectedBlock = block;
    });
  }

  onBlockClick(block: any) {
    this.blockService.setSelectedBlock(block);
  }
}
