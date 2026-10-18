type CamelCase<Name extends string> = Name extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : Name;
type OptionName<Flags extends string> = Flags extends `${string}--${infer Long}`
  ? Long extends `${infer Name} ${string}`
    ? CamelCase<Name>
    : CamelCase<Long>
  : Flags extends `-${infer Short} ${string}`
    ? Short
    : never;
type OptionValueType<Flags extends string> = Flags extends `${string}<${string}`
  ? string
  : boolean;
export declare class Argument<
  Options extends {
    help: boolean;
  } = {
    help: boolean;
  },
> {
  #private;
  static new(...args: ConstructorParameters<typeof Argument>): Argument<{
    help: boolean;
  }>;
  get options(): Options;
  get args(): readonly string[];
  constructor(name: string);
  abort(message?: string, code?: number): never;
  option<const Flags extends string, const Default extends string | boolean>(
    flags: Flags,
    description: string,
    defaultValue: Default
  ): Argument<Options & Record<OptionName<Flags>, Default>>;
  requiredOption<const Flags extends string>(
    flags: Flags,
    description: string
  ): Argument<Options & Record<OptionName<Flags>, OptionValueType<Flags>>>;
  command(usage: string, description: string): this;
  example(example: string): this;
  parse(args: readonly string[]): this;
  help(): string;
}
export {};
