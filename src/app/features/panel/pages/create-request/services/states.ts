import { computed, Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StatesService {
  private readonly _states = signal<Map<string, number>>(new Map());

  readonly states = this._states.asReadonly();

  updateState(key: string, index: number) {
    this._states.update((current) => {
      const newMap = new Map(current);

      newMap.set(key, index);

      return newMap;
    });
  }

  getState(key: string): Signal<number | null> {
    return computed(() => this._states().get(key) ?? null);
  }

  isActive(key: string, index: number): Signal<boolean> {
    return computed(() => this._states().get(key) === index);
  }

  clearState(key: string) {
    this._states.update((current) => {
      const newMap = new Map(current);

      newMap.delete(key);

      return newMap;
    });
  }

  clearAll() {
    this._states.set(new Map());
  }
}
