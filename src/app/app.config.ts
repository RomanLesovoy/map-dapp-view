import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';
import { ContractService } from './services/contract.service';
import { BlockService } from './services/block.service';
import { Web3Service } from './services/web3.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    AuthService,
    ContractService,
    Web3Service,
    BlockService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};
