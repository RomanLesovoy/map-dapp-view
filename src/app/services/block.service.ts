import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BlockInfo } from './contract.service';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private selectedBlockSubject = new BehaviorSubject<BlockInfo | null>(null);
  selectedBlock$ = this.selectedBlockSubject.asObservable();

  setSelectedBlock(block: BlockInfo) {
    this.selectedBlockSubject.next(block);
  }

  clearSelectedBlock() {
    this.selectedBlockSubject.next(null);
  }
}
