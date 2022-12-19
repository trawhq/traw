export class UnsupportedBrowserException extends Error {
  constructor(message: string) {
    super(`Unsupported browser - ${message}`);
  }
}
