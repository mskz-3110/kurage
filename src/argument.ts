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
  choices?: readonly string[];
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

type OptionValues<
  Flags extends string,
  Value,
  Choices extends readonly string[] | undefined,
> =
  | (Choices extends readonly string[] ? Choices[number] : Value)
  | (Flags extends `${string}<${string}`
      ? (Choices extends readonly string[] ? Choices[number] : Value)[]
      : never);

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
    defaultValue: string | boolean = false,
    choices?: readonly string[]
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
      ...(choices === undefined ? {} : { choices }),
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

  abort(message = '', code = 2): never {
    Logger.err(this.help());
    Process.abort(message, code);
  }

  option<
    const Flags extends string,
    const Default extends string | boolean,
    const Choices extends readonly string[] | undefined = undefined,
  >(
    flags: Flags,
    description: string,
    defaultValue: Default,
    choices?: Choices
  ): Argument<
    Options & Record<OptionName<Flags>, OptionValues<Flags, Default, Choices>>
  > {
    return this.#addOption(flags, description, false, defaultValue, choices) as Argument<
      Options & Record<OptionName<Flags>, OptionValues<Flags, Default, Choices>>
    >;
  }

  requiredOption<
    const Flags extends string,
    const Choices extends readonly string[] | undefined = undefined,
  >(
    flags: Flags,
    description: string,
    defaultValue: string | boolean = /[<[][^>\]]+[>\]]/.test(flags) ? '' : false,
    choices?: Choices
  ): Argument<
    Options &
      Record<OptionName<Flags>, OptionValues<Flags, OptionValueType<Flags>, Choices>>
  > {
    return this.#addOption(flags, description, true, defaultValue, choices) as Argument<
      Options &
        Record<OptionName<Flags>, OptionValues<Flags, OptionValueType<Flags>, Choices>>
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
    const optionValues = Object.create(null) as Record<
      string,
      string | boolean | (string | boolean)[]
    >;
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

      const wasSet = specifiedOptionNames.has(matchedOptionDefinition.name);
      specifiedOptionNames.add(matchedOptionDefinition.name);
      if (!matchedOptionDefinition.takesValue) {
        optionValues[matchedOptionDefinition.name] = true;
        continue;
      }

      if (index + 1 >= args.length) {
        this.abort(`Missing value: ${matchedOptionDefinition.flags}`);
      }

      const value = args[++index]!;
      if (
        matchedOptionDefinition.choices != null &&
        !matchedOptionDefinition.choices.includes(value)
      ) {
        this.abort(
          `Invalid choice(${matchedOptionDefinition.flags}): ${value} ${JSON.stringify(matchedOptionDefinition.choices)}`
        );
      }
      if (wasSet) {
        const previousValue = optionValues[matchedOptionDefinition.name];
        if (Array.isArray(previousValue)) {
          previousValue.push(value);
        } else {
          optionValues[matchedOptionDefinition.name] = [previousValue as string, value];
        }
      } else {
        optionValues[matchedOptionDefinition.name] = value;
      }
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
      this.abort('', 0);
    }

    return this;
  }

  help(): string {
    const requiredOptions = this.#optionDefinitions.filter((option) => option.required);
    const options = this.#optionDefinitions
      .filter((option) => !option.required)
      .toSorted((a, b) => Number(a.name === 'help') - Number(b.name === 'help'));
    const allOptions = [...requiredOptions, ...options];
    const typeDefaultValue = (option: OptionDefinition) =>
      `(${option.takesValue ? 'string' : 'boolean'}:${JSON.stringify(option.defaultValue)})`;
    const commandWidths = {
      usage: Math.max(
        0,
        ...this.#commandDefinitions.map(
          (commandDefinition) => commandDefinition.usage.length
        )
      ),
    };
    const optionWidths = {
      flags: Math.max(0, ...allOptions.map((option) => option.flags.length)),
      typeDefaultValue: Math.max(
        0,
        ...allOptions.map((option) => typeDefaultValue(option).length)
      ),
      description: Math.max(0, ...allOptions.map((option) => option.description.length)),
    };
    const appendOptions = (title: string, definitions: OptionDefinition[]) => {
      if (definitions.length === 0) {
        return;
      }

      builder.line(`${title}:`);
      for (const option of definitions) {
        builder.line(
          `  ${option.flags.padEnd(optionWidths.flags)} ${typeDefaultValue(option).padEnd(optionWidths.typeDefaultValue)} ${option.description}${option.choices == null ? '' : ` ${JSON.stringify(option.choices)}`}`
        );
      }
    };
    const builder = Line.builder
      .new()
      .append('Usage: ')
      .append(this.#name)
      .append(' [options]')
      .append(' [command]', this.#commandDefinitions.length > 0)
      .push();
    appendOptions('Required Options', requiredOptions);
    appendOptions('Options', options);
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
