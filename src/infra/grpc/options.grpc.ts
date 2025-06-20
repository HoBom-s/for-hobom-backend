import { join } from "path";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const grpcOptions: MicroserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: "outbox",
    protoPath: join(
      __dirname,
      "../../../hobom-buf-proto/proto/menu/outbox/v1/hobom-menu-outbox.proto",
    ),
    url: "0.0.0.0:50051",
  },
};
