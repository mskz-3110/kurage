export declare class Process {
  #private;
  static get args(): readonly string[];
  static abort(message?: string, exitCode?: number): never;
  static setup(): void;
  static cleanup(): void;
}
