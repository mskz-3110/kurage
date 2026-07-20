var Scanner = class Scanner {
  static new(...args) {
    return new Scanner(...args);
  }
  #matchers;
  constructor(matchers) {
    this.#matchers = matchers;
  }
  scan(index, line) {
    for (const [name, matcher] of Object.entries(this.#matchers)) {
      const matches = line.match(matcher);
      if (matches != null)
        return {
          index,
          name,
          text: matches[1] ?? matches[0],
        };
    }
  }
};
var Line = class Line {
  static eol = '\n';
  static get scanner() {
    return Scanner;
  }
  static join(lines, eol = Line.eol) {
    return lines.join(eol);
  }
  static split(text, eol = Line.eol) {
    return text === '' ? [] : text.split(eol);
  }
};

export { Line, Scanner };
