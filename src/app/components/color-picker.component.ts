import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="color-grid">
      <div *ngFor="let color of colors; let i = index" 
           [style.background-color]="color"
           (click)="selectColor(i)"
           [class.selected]="i === selectedColor">
      </div>
    </div>
  `,
  styles: [`
    .color-grid {
      display: grid;
      grid-template-columns: repeat(16, 1fr);
      gap: 3px;
      margin-bottom: 15px;
    }
    .color-grid div {
      width: 12px;
      height: 12px;
      border: 1px solid black;
      cursor: pointer;
    }
    .selected {
      border: 2px solid white;
      box-shadow: 0 0 0 2px #333;
    }
  `]
})
export class ColorPickerComponent {
  @Output() colorSelected = new EventEmitter<number>();
  @Input({ required: true }) selectedColor!: number;
  public readonly colors: string[] = [];

  constructor() {
    this.generateColors();
  }

  generateColors() {
    for (let r = 0; r < 8; r++) {
      for (let g = 0; g < 8; g++) {
        for (let b = 0; b < 4; b++) {
          this.colors.push(`rgb(${r*32}, ${g*32}, ${b*64})`);
        }
      }
    }
  }

  selectColor(index: number) {
    this.selectedColor = index;
    this.colorSelected.emit(index);
  }
}
