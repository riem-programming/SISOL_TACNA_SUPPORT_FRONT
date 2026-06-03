export function emptyToNull(value: string): string | null {
  return value.trim().length > 0 ? value : null;
}
