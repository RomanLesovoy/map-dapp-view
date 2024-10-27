import { Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockInfo } from '../services/contract.service';
import { BlockService } from '../services/block.service';
import { ContractService } from '../services/contract.service';
import { Web3Service } from '../services/web3.service';
import { FormsModule } from '@angular/forms';
import { ColorPickerComponent } from '../components/color-picker.component';
import { AddressPipe } from '../pipes/address.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ColorPickerComponent, AddressPipe],
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss']
})
export class BlockDetailsComponent implements OnInit {
  selectedBlock: BlockInfo | null = null;
  canBuy = false;
  canSetPrice = false;
  canSetColor = false;
  isOpen = false;
  isOwner = false;

  constructor(
    private readonly blockService: BlockService,
    private readonly contractService: ContractService,
    private readonly web3Service: Web3Service,
    private readonly destroy$: DestroyRef,
  ) {}

  ngOnInit() {
    this.blockService.selectedBlock$
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe((block) => {
        const currentAddress = this.web3Service.getCurrentAddress();

        this.selectedBlock = block;
        this.isOpen = !!block;
        this.isOwner = currentAddress === block?.owner;
        this.canBuy = Boolean(block?.price && Number(block.price) > 0) && !this.isOwner;
        this.canSetPrice = this.isOwner;
        this.canSetColor = this.isOwner;
      });
  }

  close() {
    this.blockService.clearSelectedBlock();
  }

  onColorSelected(color: number) {
    this.selectedBlock!.color = color;
  }

  async buyBlock() {
    this.contractService.buyBlockDirectly(this.selectedBlock!);
  }

  async setPrice() {
    this.contractService.setBlockPriceDirectly(Number(this.selectedBlock!.id), Number(this.selectedBlock!.price));
  }

  async setColor() {
    this.contractService.setBlockColorDirectly(Number(this.selectedBlock!.id), Number(this.selectedBlock!.color));
  }
}
