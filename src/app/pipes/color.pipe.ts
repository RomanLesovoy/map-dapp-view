import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'color',
  standalone: true,
})
export class ColorPipe implements PipeTransform {
  transform(color: number): string {
    const r = (color & 0xE0) >> 5;  // Get first 3 bits
    const g = (color & 0x1C) >> 2;  // Get next 3 bits
    const b = color & 0x03;         // Get last 2 bits
    
    // Scale values to 0-255 range
    const scaledR = Math.round(r * 255 / 7);
    const scaledG = Math.round(g * 255 / 7);
    const scaledB = Math.round(b * 255 / 3);
    
    return `rgb(${scaledR}, ${scaledG}, ${scaledB})`;
  }
}