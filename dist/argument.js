import { Backtrace } from './backtrace.js';
import { Line } from './line.js';
import { Logger } from './logger.js';
import { Process } from './process.js';

var Argument = class Argument {
  static new(...args) {
    return new Argument(...args);
  }
  #name;
  #optionDefinitions = [];
  #commandDefinitions = [];
  #examples = [];
  #options = { help: false };
  get options() {
    return this.#options;
  }
  #args = [];
  get args() {
    return this.#args;
  }
  constructor(name) {
    this.#name = name;
    this.option('-h, --help', 'Display help', false);
  }
  #addOption(flags, description, required, defaultValue = false, choices) {
    const aliases = flags.match(/--?[\w-]+/g) ?? [];
    const optionName = (
      aliases.find((alias) => alias.startsWith('--')) ??
      aliases[0] ??
      ''
    )
      .replace(/^-+/, '')
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (optionName === '')
      this.abort(Line.join(['Invalid flags: empty', Backtrace.new().toString()]));
    const optionDefinition = {
      flags,
      aliases,
      name: optionName,
      takesValue: /[<[][^>\]]+[>\]]/.test(flags),
      description,
      required,
      defaultValue,
      ...(choices === void 0 ? {} : { choices }),
    };
    const definitionIndex = this.#optionDefinitions.findIndex(
      (optionDefinition) => optionDefinition.flags === flags
    );
    if (definitionIndex < 0) this.#optionDefinitions.push(optionDefinition);
    else this.#optionDefinitions[definitionIndex] = optionDefinition;
    return this;
  }
  abort(message = '', code = 2) {
    Logger.err(this.help());
    Process.abort(message, code);
  }
  option(flags, description, defaultValue, choices) {
    return this.#addOption(flags, description, false, defaultValue, choices);
  }
  requiredOption(
    flags,
    description,
    defaultValue = /[<[][^>\]]+[>\]]/.test(flags) ? '' : false,
    choices
  ) {
    return this.#addOption(flags, description, true, defaultValue, choices);
  }
  command(usage, description) {
    this.#commandDefinitions.push({
      usage,
      description,
    });
    return this;
  }
  example(example) {
    this.#examples.push(example);
    return this;
  }
  parse(args) {
    this.#args = [];
    const optionValues = Object.create(null);
    const specifiedOptionNames = /* @__PURE__ */ new Set();
    for (const optionDefinition of this.#optionDefinitions)
      optionValues[optionDefinition.name] = optionDefinition.defaultValue;
    for (let index = 0; index < args.length; index += 1) {
      if (args[index] === '--') {
        this.#args = args.slice(index + 1);
        break;
      }
      if (!args[index].startsWith('-')) {
        this.#args = args.slice(index);
        break;
      }
      const matchedOptionDefinition = this.#optionDefinitions.find((optionDefinition) =>
        optionDefinition.aliases.includes(args[index])
      );
      if (matchedOptionDefinition == null) this.abort(`Unknown option: ${args[index]}`);
      const wasSet = specifiedOptionNames.has(matchedOptionDefinition.name);
      specifiedOptionNames.add(matchedOptionDefinition.name);
      if (!matchedOptionDefinition.takesValue) {
        optionValues[matchedOptionDefinition.name] = true;
        continue;
      }
      if (index + 1 >= args.length)
        this.abort(`Missing value: ${matchedOptionDefinition.flags}`);
      const value = args[++index];
      if (
        matchedOptionDefinition.choices != null &&
        !matchedOptionDefinition.choices.includes(value)
      )
        this.abort(
          `Invalid choice(${matchedOptionDefinition.flags}): ${value} ${JSON.stringify(matchedOptionDefinition.choices)}`
        );
      if (wasSet) {
        const previousValue = optionValues[matchedOptionDefinition.name];
        if (Array.isArray(previousValue)) previousValue.push(value);
        else optionValues[matchedOptionDefinition.name] = [previousValue, value];
      } else optionValues[matchedOptionDefinition.name] = value;
    }
    const helpSpecified = specifiedOptionNames.has('help');
    const missingRequiredOption = this.#optionDefinitions.find(
      (optionDefinition) =>
        optionDefinition.required &&
        !specifiedOptionNames.has(optionDefinition.name) &&
        !helpSpecified
    );
    if (missingRequiredOption != null)
      this.abort(`Missing required option: ${missingRequiredOption.flags}`);
    this.#options = optionValues;
    if (helpSpecified) this.abort('', 0);
    return this;
  }
  help() {
    const requiredOptions = this.#optionDefinitions.filter((option) => option.required);
    const options = this.#optionDefinitions
      .filter((option) => !option.required)
      .toSorted((a, b) => Number(a.name === 'help') - Number(b.name === 'help'));
    const allOptions = [...requiredOptions, ...options];
    const typeDefaultValue = (option) =>
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
    const appendOptions = (title, definitions) => {
      if (definitions.length === 0) return;
      builder.line(`${title}:`);
      for (const option of definitions)
        builder.line(
          `  ${option.flags.padEnd(optionWidths.flags)} ${typeDefaultValue(option).padEnd(optionWidths.typeDefaultValue)} ${option.description}${option.choices == null ? '' : ` ${JSON.stringify(option.choices)}`}`
        );
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
      for (const commandDefinition of this.#commandDefinitions)
        builder.line(
          `  ${commandDefinition.usage.padEnd(commandWidths.usage)} ${commandDefinition.description}`
        );
    }
    if (this.#examples.length > 0) {
      builder.line('Examples:');
      for (const example of this.#examples) builder.line(`  ${example}`);
    }
    return builder.toString();
  }
};

export { Argument };
