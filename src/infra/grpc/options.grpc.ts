import { join } from "path";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const grpcOptions: MicroserviceOptions = {
  transport: Transport.GRPC,
  options: {
    url: "0.0.0.0:50051",
    package: ["outbox.menu", "outbox.log"],
    protoPath: [
      join(
        __dirname,
        "../../../hobom-buf-proto/menu/outbox/v1/hobom-menu-outbox.proto",
      ),
      join(
        __dirname,
        "../../../hobom-buf-proto/menu/outbox/v1/patch-hobom-menu-outbox.proto",
      ),
      join(
        __dirname,
        "../../../hobom-buf-proto/log/outbox/v1/hobom-log-outbox.proto",
      ),
    ],
  },
};
