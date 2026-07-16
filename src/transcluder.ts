import { Bytes } from './bytes.js';
import { Scanner } from './line.js';
import { Spellbook } from './spellbook.js';

type Node = {
  symbol: string;
  content: string;
  start: {
    index: number;
    format: string;
  };
  end: {
    index: number;
    format: string;
  };
  children: Node[];
};

export type Element = Omit<Node, 'children'>;

export class Parser {
  static new(...args: ConstructorParameters<typeof Parser>): Parser {
    return new Parser(...args);
  }

  #scanner: Scanner = Scanner.new({
    comment: /<!--\s*:\s*([\s\S]*\S)\s*-->/,
  });

  parse(lines: string[]): Element[] {
    const nodes: Node[] = [];
    const stack: Node[] = [];
    lines.forEach((line, index) => {
      const match = this.#scanner.scan(index, line);
      if (match == null) {
        return;
      }

      if (match.text.length === 0) {
        return;
      }

      if (match.text.startsWith('}')) {
        const closeNode = stack.pop();
        if (closeNode != null) {
          closeNode.end.index = match.index;
          closeNode.end.format = match.text.slice(1);
        }
        return;
      }

      if (match.text.indexOf('{') < 0) {
        return;
      }

      const symbol = match.text.slice(0, 1);
      const [content, format] = match.text.slice(1).split(/(?<!\\)\{/);
      const node: Node = {
        symbol: symbol === '{' ? '' : symbol,
        content: content!.trim(),
        start: {
          index: match.index,
          format: format!,
        },
        end: {
          index: -1,
          format: '',
        },
        children: [],
      };

      if (0 < stack.length) {
        stack[stack.length - 1]!.children.push(node);
      } else {
        nodes.push(node);
      }
      stack.push(node);
    });
    return nodes
      .filter((node) => node.symbol !== '')
      .map(({ children, ...element }) => element);
  }

  sanitize(line: string): string {
    return this.#scanner.scan(-1, line) == null ? line : '';
  }
}

export type Marker = Omit<Element, 'symbol' | 'content'> & {
  lines: string[];
};

export class Replacer {
  static new(...args: ConstructorParameters<typeof Replacer>): Replacer {
    return new Replacer(...args);
  }

  #markers: Marker[] = [];

  addMarker(marker: Marker) {
    this.#markers.unshift(marker);
    this.#markers.sort((a, b) => b.end.index - a.end.index);
  }

  replaceLines(lines: string[]): string[] {
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

      if (marker.start.format !== '') {
        replacedLines.splice(marker.start.index + 1, 0, marker.start.format);
      }
    }
    return replacedLines;
  }
}

export class Transcluder {
  static get parser(): typeof Parser {
    return Parser;
  }

  static get replacer(): typeof Replacer {
    return Replacer;
  }

  static new(...args: ConstructorParameters<typeof Transcluder>): Transcluder {
    return new Transcluder(...args);
  }

  async transcludeLinesAsync(
    dir: string,
    lines: string[],
    encoding: BufferEncoding = 'utf8'
  ): Promise<string[]> {
    const replacer = Replacer.new();
    await Spellbook.chdirAsync(dir, async () => {
      const parser = Parser.new();
      for (const element of parser.parse(lines)) {
        if (element.symbol === '<') {
          replacer.addMarker({
            lines: (await Spellbook.readLinesAsync(element.content, encoding)).map(
              (line) => parser.sanitize(line)
            ),
            ...element,
          });
        }
      }
    });
    return replacer.replaceLines(lines);
  }

  async transcludeFileAsync(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<boolean> {
    const lines = await Spellbook.readLinesAsync(path, encoding);
    lines.push('');
    const replacedLines = await this.transcludeLinesAsync(
      Spellbook.dirname(path),
      lines,
      encoding
    );
    if (lines.length === replacedLines.length) {
      if (!lines.some((line, index) => line !== replacedLines[index])) {
        return false;
      }
    }

    Spellbook.replace(path, Bytes.fromLines(replacedLines));
    return true;
  }
}
