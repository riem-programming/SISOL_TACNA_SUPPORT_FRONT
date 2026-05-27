import { Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CardInput } from './model/card.model';

@Component({
  selector: 'app-card',
  imports: [MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  value = input.required<CardInput>();
  onClickButton = output<void>();
  disabled = signal(false);

  managerClickButton() {
    this.disabled.set(true);
    this.onClickButton.emit();
  }
}
