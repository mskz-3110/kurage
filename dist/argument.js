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
  #addOption(flags, description, required, defaultValue = false) {
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
    };
    const definitionIndex = this.#optionDefinitions.findIndex(
      (optionDefinition) => optionDefinition.flags === flags
    );
    if (definitionIndex < 0) this.#optionDefinitions.push(optionDefinition);
    else this.#optionDefinitions[definitionIndex] = optionDefinition;
    return this;
  }
  abort(message = '') {
    Logger.err(this.help());
    Process.abort(message, 2);
  }
  option(flags, description, defaultValue) {
    return this.#addOption(flags, description, false, defaultValue);
  }
  requiredOption(flags, description) {
    return this.#addOption(flags, description, true);
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
    const optionValues = {};
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
      specifiedOptionNames.add(matchedOptionDefinition.name);
      if (!matchedOptionDefinition.takesValue) {
        optionValues[matchedOptionDefinition.name] = true;
        continue;
      }
      if (index + 1 >= args.length)
        this.abort(`Missing value: ${matchedOptionDefinition.flags}`);
      optionValues[matchedOptionDefinition.name] = args[++index];
    }
    if (!specifiedOptionNames.has('help')) {
      const missingRequiredOption = this.#optionDefinitions.find(
        (optionDefinition) =>
          optionDefinition.required && !specifiedOptionNames.has(optionDefinition.name)
      );
      if (missingRequiredOption != null)
        this.abort(`Missing required option: ${missingRequiredOption.flags}`);
    }
    this.#options = optionValues;
    if (optionValues.help === true) this.abort();
    return this;
  }
  help() {
    const options = this.#optionDefinitions.toSorted(
      (a, b) => Number(a.name === 'help') - Number(b.name === 'help')
    );
    const typeLabel = (option) =>
      `(${option.takesValue ? 'string' : 'boolean'}:${option.required ? 'Required' : JSON.stringify(option.defaultValue)})`;
    const widths = {
      command: Math.max(
        0,
        ...this.#commandDefinitions.map(
          (commandDefinition) => commandDefinition.usage.length
        )
      ),
      flags: Math.max(0, ...options.map((option) => option.flags.length)),
      typeLabel: Math.max(0, ...options.map((option) => typeLabel(option).length)),
      description: Math.max(0, ...options.map((option) => option.description.length)),
    };
    return Line.join([
      `Usage: ${this.#name} [options]${this.#commandDefinitions.length > 0 ? ' [command]' : ''}`,
      'Options:',
      ...options.map(
        (option) =>
          `  ${option.flags.padEnd(widths.flags)} ${typeLabel(option).padEnd(widths.typeLabel)} ${option.description.padEnd(widths.description)}`
      ),
      ...(this.#commandDefinitions.length > 0
        ? [
            'Commands:',
            ...this.#commandDefinitions.map(
              (commandDefinition) =>
                `  ${commandDefinition.usage.padEnd(widths.command)} ${commandDefinition.description}`
            ),
          ]
        : []),
      ...(this.#examples.length > 0
        ? ['Examples:', ...this.#examples.map((example) => `  ${example}`)]
        : []),
    ]);
  }
};

export { Argument };
