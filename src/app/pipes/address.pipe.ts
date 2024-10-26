import { PipeTransform, Pipe } from "@angular/core";

@Pipe({
  name: 'address',
  standalone: true,
})
export class AddressPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.slice(0, 6) + '...' + value.slice(-4);
  }
}
