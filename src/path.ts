import fsModule from 'node:fs';
import pathModule from 'node:path';

export class Path {
  static #root: string = process.env.INIT_CWD ?? process.cwd();

  static get root():string {return Path.#root;}

  static exists(path: string): boolean {
    return fsModule.existsSync(path);
  }

  static cwd(): string {
    return process.cwd();
  }

  static absolute(path: string): string {
    return pathModule.resolve(path);
  }

  static relative(toPath: string, fromPath: string = Path.cwd()): string {
    return pathModule.relative(fromPath, toPath);
  }

  static new(...args: ConstructorParameters<typeof Path>): Path {
    return new Path(...args);
  }

  static parse(path: string): Path {
    const {dir, name, ext} = pathModule.parse(path);
    return new Path(dir, name, ext);
  }

  #dir: string;

  get dir(): string {return this.#dir;}

  #name: string;

  get name(): string {return this.#name;}

  #ext: string;

  get ext(): string {return this.#ext;}

  get base(): string {return `${this.#name}${this.#ext}`;}

  constructor(dir:string = '', name:string = '', ext:string = '') {
    this.#dir = Path.absolute(dir);
    this.#name = name;
    if (ext !== '' && !ext.startsWith('.')) {
      this.#ext = `.${ext}`;
    } else {
      this.#ext = ext;
    }
  }

  toString(): string {
    return pathModule.join(this.#dir, this.base);
  }
}
