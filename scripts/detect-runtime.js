function detectRuntime() {
  if (typeof Deno !== "undefined") {
    return "deno";
  }

  if (typeof Bun !== "undefined") {
    return "bun";
  }

  if (typeof process !== "undefined" && process.versions?.node) {
    return "node";
  }

  return "unknown";
}

console.log(detectRuntime());
