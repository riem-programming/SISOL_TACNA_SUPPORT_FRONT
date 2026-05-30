import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StatesService } from '../../services/states';

@Component({
  selector: 'app-stepper-button',
  imports: [MatIconModule],
  templateUrl: './button.html',
  styleUrls: ['./button.css', './button.material.scss'],
})
export class Button {
  isHorizontal = input(true);
  key = input.required<string>();
  index = input.required<number>();
  title = input.required<string>();
  description = input.required<string>();
  emoji = input.required<string>();

  private readonly statesService = inject(StatesService);
  isActive = computed(() => this.statesService.isActive(this.key(), this.index())());
  onClickButton = output<void>();
  managerClickButton() {
    this.onClickButton.emit();
  }
}
