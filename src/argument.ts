import { Backtrace } from './backtrace.js';
import { Line } from './line.js';
import { Logger } from './logger.js';
import { Process } from './process.js';

type OptionDefinition = {
  flags: string;
  aliases: string[];
  name: string;
  takesValue: boolean;
  description: string;
  required: boolean;
  defaultValue: string | boolean;
};

type CommandDefinition = {
  usage: string;
  description: string;
};

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

export class Argument<Options extends { help: boolean } = { help: boolean }> {
  static new(
    ...args: ConstructorParameters<typeof Argument>
  ): Argument<{ help: boolean }> {
    return new Argument(...args);
  }

  #name: string;

  #optionDefinitions: OptionDefinition[] = [];

  #commandDefinitions: CommandDefinition[] = [];

  #examples: string[] = [];

  #options: Options = { help: false } as Options;

  get options(): Options {
    return this.#options;
  }

  #args: readonly string[] = [];

  get args(): readonly string[] {
    return this.#args;
  }

  constructor(name: string) {
    this.#name = name;
    this.option('-h, --help', 'Display help', false);
  }

  #addOption(
    flags: string,
    description: string,
    required: boolean,
    defaultValue: string | boolean = false
  ): Argument {
    const aliases = flags.match(/--?[\w-]+/g) ?? [];
    const optionName = (
      aliases.find((alias) => alias.startsWith('--')) ??
      aliases[0] ??
      ''
    )
      .replace(/^-+/, '')
      .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    if (optionName === '') {
      this.abort(Line.join(['Invalid flags: empty', Backtrace.new().toString()]));
    }

    const optionDefinition = {
      flags,
      aliases,
      name: optionName,
      takesValue: /[<[][^>\]]+[>\]]/.test(flags),
      description,
      required,
      defaultValue,
    };
    const definitionIndex = this.#optionDefinitions.findIndex(
      (optionDefinition) => optionDefinition.flags === flags
    );
    if (definitionIndex < 0) {
      this.#optionDefinitions.push(optionDefinition);
    } else {
      this.#optionDefinitions[definitionIndex] = optionDefinition;
    }
    return this;
  }

  abort(message = ''): never {
    Logger.err(this.help());
    Process.abort(message, 2);
  }

  option<const Flags extends string, const Default extends string | boolean>(
    flags: Flags,
    description: string,
    defaultValue: Default
  ): Argument<Options & Record<OptionName<Flags>, Default>> {
    return this.#addOption(flags, description, false, defaultValue) as Argument<
      Options & Record<OptionName<Flags>, Default>
    >;
  }

  requiredOption<const Flags extends string>(
    flags: Flags,
    description: string
  ): Argument<Options & Record<OptionName<Flags>, OptionValueType<Flags>>> {
    return this.#addOption(flags, description, true) as Argument<
      Options & Record<OptionName<Flags>, OptionValueType<Flags>>
    >;
  }

  command(usage: string, description: string): this {
    this.#commandDefinitions.push({ usage, description });
    return this;
  }

  example(example: string): this {
    this.#examples.push(example);
    return this;
  }

  parse(args: readonly string[]): this {
    this.#args = [];
    const optionValues = Object.create(null) as Record<string, string | boolean>;
    const specifiedOptionNames = new Set<string>();
    for (const optionDefinition of this.#optionDefinitions) {
      optionValues[optionDefinition.name] = optionDefinition.defaultValue;
    }

    for (let index = 0; index < args.length; index += 1) {
      if (args[index] === '--') {
        this.#args = args.slice(index + 1);
        break;
      }

      if (!args[index]!.startsWith('-')) {
        this.#args = args.slice(index);
        break;
      }

      const matchedOptionDefinition = this.#optionDefinitions.find((optionDefinition) =>
        optionDefinition.aliases.includes(args[index]!)
      );
      if (matchedOptionDefinition == null) {
        this.abort(`Unknown option: ${args[index]}`);
      }

      specifiedOptionNames.add(matchedOptionDefinition.name);
      if (!matchedOptionDefinition.takesValue) {
        optionValues[matchedOptionDefinition.name] = true;
        continue;
      }

      if (index + 1 >= args.length) {
        this.abort(`Missing value: ${matchedOptionDefinition.flags}`);
      }

      optionValues[matchedOptionDefinition.name] = args[++index]!;
    }

    const helpSpecified = specifiedOptionNames.has('help');
    const missingRequiredOption = this.#optionDefinitions.find(
      (optionDefinition) =>
        optionDefinition.required &&
        !specifiedOptionNames.has(optionDefinition.name) &&
        !helpSpecified
    );
    if (missingRequiredOption != null) {
      this.abort(`Missing required option: ${missingRequiredOption.flags}`);
    }

    this.#options = optionValues as Options;
    if (helpSpecified) {
      this.abort();
    }

    return this;
  }

  help(): string {
    const options = this.#optionDefinitions.toSorted(
      (a, b) => Number(a.name === 'help') - Number(b.name === 'help')
    );
    const typeLabel = (option: OptionDefinition) =>
      `(${option.takesValue ? 'string' : 'boolean'}:${option.required ? 'Required' : JSON.stringify(option.defaultValue)})`;
    const commandWidths = {
      usage: Math.max(
        0,
        ...this.#commandDefinitions.map(
          (commandDefinition) => commandDefinition.usage.length
        )
      ),
    };
    const optionWidths = {
      flags: Math.max(0, ...options.map((option) => option.flags.length)),
      typeLabel: Math.max(0, ...options.map((option) => typeLabel(option).length)),
      description: Math.max(0, ...options.map((option) => option.description.length)),
    };
    const builder = Line.builder
      .new()
      .append('Usage: ')
      .append(this.#name)
      .append(' [options]')
      .append(' [command]', this.#commandDefinitions.length > 0)
      .push()
      .line('Options:');
    for (const option of options) {
      builder.line(
        `  ${option.flags.padEnd(optionWidths.flags)} ${typeLabel(option).padEnd(optionWidths.typeLabel)} ${option.description.padEnd(optionWidths.description)}`
      );
    }
    if (this.#commandDefinitions.length > 0) {
      builder.line('Commands:');
      for (const commandDefinition of this.#commandDefinitions) {
        builder.line(
          `  ${commandDefinition.usage.padEnd(commandWidths.usage)} ${commandDefinition.description}`
        );
      }
    }
    if (this.#examples.length > 0) {
      builder.line('Examples:');
      for (const example of this.#examples) {
        builder.line(`  ${example}`);
      }
    }
    return builder.toString();
  }
}
