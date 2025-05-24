export class ObjectHelper {
  public static isEmpty(object: object): boolean {
    return Object.keys(object).length === 0;
  }
}
