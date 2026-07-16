import { Line, Scanner } from './line.js';
import { Spellbook } from './spellbook.js';

var Parser = class Parser {
  static new(...args) {
    return new Parser(...args);
  }
  #scanner = Scanner.new({ comment: /<!--\s*:\s*([\s\S]*\S)\s*-->/ });
  parse(lines) {
    const nodes = [];
    const stack = [];
    lines.forEach((line, index) => {
      const match = this.#scanner.scan(index, line);
      if (match == null) return;
      if (match.text.length === 0) return;
      if (match.text.startsWith('}')) {
        const closeNode = stack.pop();
        if (closeNode != null) {
          closeNode.end.index = match.index;
          closeNode.end.format = match.text.slice(1);
        }
        return;
      }
      if (match.text.indexOf('{') < 0) return;
      const symbol = match.text.slice(0, 1);
      const [content, format] = match.text.slice(1).split(/(?<!\\)\{/);
      const node = {
        symbol: symbol === '{' ? '' : symbol,
        content: content.trim(),
        start: {
          index: match.index,
          format,
        },
        end: {
          index: -1,
          format: '',
        },
        children: [],
      };
      if (0 < stack.length) stack[stack.length - 1].children.push(node);
      else nodes.push(node);
      stack.push(node);
    });
    return nodes
      .filter((node) => node.symbol !== '')
      .map(({ children, ...element }) => element);
  }
  sanitize(line) {
    return this.#scanner.scan(-1, line) == null ? line : '';
  }
};
var Replacer = class Replacer {
  static new(...args) {
    return new Replacer(...args);
  }
  #markers = [];
  addMarker(marker) {
    this.#markers.unshift(marker);
    this.#markers.sort((a, b) => b.end.index - a.end.index);
  }
  replaceLines(lines) {
    const replacedLines = [...lines];
    for (const marker of this.#markers) {
      replacedLines.splice(
        marker.start.index + 1,
        marker.end.index - marker.start.index - 1,
        ...marker.lines
      );
      if (marker.end.format !== '') {
        const diffLength =
          marker.lines.length - (marker.end.index - marker.start.index - 1);
        replacedLines.splice(marker.end.index + diffLength, 0, marker.end.format);
      }
      if (marker.start.format !== '')
        replacedLines.splice(marker.start.index + 1, 0, marker.start.format);
    }
    return replacedLines;
  }
};
var Transcluder = class Transcluder {
  static get parser() {
    return Parser;
  }
  static get replacer() {
    return Replacer;
  }
  static new(...args) {
    return new Transcluder(...args);
  }
  async transcludeLinesAsync(dir, lines, encoding = 'utf8') {
    const replacer = Replacer.new();
    await Spellbook.chdirAsync(dir, async () => {
      const parser = Parser.new();
      for (const element of parser.parse(lines))
        if (element.symbol === '<')
          replacer.addMarker({
            lines: (await Spellbook.readLinesAsync(element.content, encoding)).map(
              (line) => parser.sanitize(line)
            ),
            ...element,
          });
    });
    return replacer.replaceLines(lines);
  }
  async transcludeFileAsync(path, encoding = 'utf8') {
    const lines = await Spellbook.readLinesAsync(path, encoding);
    lines.push('');
    const replacedLines = await this.transcludeLinesAsync(
      Spellbook.dirname(path),
      lines,
      encoding
    );
    if (lines.length === replacedLines.length) {
      if (!lines.some((line, index) => line !== replacedLines[index])) return false;
    }
    Spellbook.replace(path, Line.join(replacedLines));
    return true;
  }
};

export { Parser, Replacer, Transcluder };
