import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from '../../services/contract.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-pixel-loader-modal',
  templateUrl: './pixel-loader-modal.component.html',
  styleUrls: ['./pixel-loader-modal.component.scss']
})
export class PixelLoaderModalComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(
    private contractService: ContractService
  ) {
    this.isLoading$ = this.contractService.isLoading$;
  }

  ngOnInit(): void {}
}
