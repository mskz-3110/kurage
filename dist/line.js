var Line = class {
  static join(lines) {
    return lines.join('\n');
  }
  static split(text) {
    return text.split('\n');
  }
};

export { Line };
