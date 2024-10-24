import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockInfo } from '../services/contract.service';
import { BlockService } from '../services/block.service';
@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss']
})
export class BlockDetailsComponent implements OnInit {
  selectedBlock: BlockInfo | null = null;
  isOpen = false;

  constructor(private blockService: BlockService) {}

  ngOnInit() {
    this.blockService.selectedBlock$.subscribe(block => {
      this.selectedBlock = block;
      this.isOpen = !!block;
    });
  }

  close() {
    this.blockService.clearSelectedBlock();
  }
}
