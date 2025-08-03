import { Cron } from "@nestjs/schedule";

interface Options {
  name: string;
  cron: string;
}

export function RegisterJob(options: Options) {
  return function (target: any) {
    const descriptor = Object.getOwnPropertyDescriptor(
      target.prototype,
      "process",
    );

    if (descriptor == null) {
      throw new Error("Register job failed !");
    }

    Cron(options.cron)(target.prototype, "process", descriptor);
  };
}
