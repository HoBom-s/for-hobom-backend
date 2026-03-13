import { TransactionRunner } from "./transaction.runner";

export function Transactional() {
  return function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const runner: TransactionRunner = this.transactionRunner;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (runner == null) {
        throw new Error("TransactionRunner not found on class");
      }

      return runner.run(() => originalMethod.apply(this, args));
    };
  };
}
