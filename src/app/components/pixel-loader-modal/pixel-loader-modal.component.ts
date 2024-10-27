import { Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from '../../services/contract.service';
import { AuthService } from '../../services/auth.service';
import { Observable, combineLatest, debounceTime, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    private contractService: ContractService,
    private authService: AuthService,
    private readonly destroy$: DestroyRef,
  ) {
    this.isLoading$ = combineLatest([
      this.contractService.isLoadingObservable$,
      this.authService.isLoadingObservable$
    ]).pipe(
      takeUntilDestroyed(this.destroy$),
      debounceTime(300),
      map(([isContractLoading, isAuthLoading]) => isContractLoading || isAuthLoading)
    );
  }

  ngOnInit(): void {}
}
