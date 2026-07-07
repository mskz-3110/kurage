export type Block = () => void | Promise<void>;
export declare class Spellbook {
  static chdir(directory: string, block?: Block): void | Promise<void>;
  static remove(path: string): void;
  static mkdir(directory: string, block?: Block): void | Promise<void>;
  static rmkdir(directory: string, block?: Block): void | Promise<void>;
}
