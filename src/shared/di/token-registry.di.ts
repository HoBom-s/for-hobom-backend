type TokenValue = symbol;

export class DITokenRegister {
  public static register(path: string): TokenValue {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (path == null) {
      throw new Error("Token path must be defined !");
    }

    return Symbol(path);
  }
}
