import { TransactionRunner } from "./transaction.runner";

export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const runner: TransactionRunner = this.transactionRunner;
      if (runner == null) {
        throw new Error("TransactionRunner not found on class");
      }

      return await runner.run(() => originalMethod.apply(this, args));
    };
  };
}
