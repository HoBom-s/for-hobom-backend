export class ChecklistItem {
  constructor(
    private readonly text: string,
    private readonly checked: boolean,
    private readonly order: number,
  ) {
    Object.freeze(this);
  }

  public static of(
    text: string,
    checked: boolean,
    order: number,
  ): ChecklistItem {
    return new ChecklistItem(text, checked, order);
  }

  public get getText(): string {
    return this.text;
  }

  public get isChecked(): boolean {
    return this.checked;
  }

  public get getOrder(): number {
    return this.order;
  }

  public toPlain(): { text: string; checked: boolean; order: number } {
    return { text: this.text, checked: this.checked, order: this.order };
  }
}
