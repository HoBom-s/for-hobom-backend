import { join } from "path";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const grpcOptions: MicroserviceOptions = {
  transport: Transport.GRPC,
  options: {
    url: "0.0.0.0:50051",
    package: ["outbox.message", "outbox.log"],
    protoPath: [
      join(
        __dirname,
        "../../../hobom-buf-proto/message/outbox/v1/find-hobom-message-outbox.proto",
      ),
      join(
        __dirname,
        "../../../hobom-buf-proto/message/outbox/v1/patch-hobom-message-outbox.proto",
      ),
      join(
        __dirname,
        "../../../hobom-buf-proto/log/outbox/v1/hobom-log-outbox.proto",
      ),
    ],
  },
};
