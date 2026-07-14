export class Line {
  static join(lines: string[]): string {
    return lines.join('\n');
  }

  static split(text: string): string[] {
    return text.split('\n');
  }
}
