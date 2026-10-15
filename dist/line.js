var Scanner = class Scanner {
  static new(...args) {
    return new Scanner(...args);
  }
  static #normalizeMatcher(matcher) {
    return new RegExp(matcher.source, matcher.flags.replace(/[gy]/g, ''));
  }
  #matchers;
  constructor(matchers) {
    this.#matchers = matchers;
  }
  scan(index, line) {
    for (const [name, matcher] of Object.entries(this.#matchers)) {
      const matches = Scanner.#normalizeMatcher(matcher).exec(line);
      if (matches != null)
        return {
          index,
          name,
          text: matches[1] ?? matches[0],
        };
    }
  }
  set(name, matcher) {
    this.#matchers[name] = matcher;
    return this;
  }
};
var Builder = class Builder {
  static new(...args) {
    return new Builder(...args);
  }
  #text = '';
  #lines = [];
  append(text, condition = true) {
    if (condition) this.#text = `${this.#text}${text}`;
    return this;
  }
  push() {
    this.line(this.#text);
    this.#text = '';
    return this;
  }
  line(text, condition = true) {
    if (condition) this.#lines.push(text);
    return this;
  }
  toString() {
    return Line.join(this.#lines);
  }
};
var Line = class Line {
  static eol = '\n';
  static get scanner() {
    return Scanner;
  }
  static get builder() {
    return Builder;
  }
  static join(lines, eol = Line.eol) {
    return lines.join(eol);
  }
  static split(text, eol = Line.eol) {
    return text === '' ? [] : text.split(eol);
  }
};

export { Builder, Line, Scanner };
