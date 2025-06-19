import { join } from "path";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const grpcOptions: MicroserviceOptions = {
  transport: Transport.GRPC,
  options: {
    package: "outbox",
    protoPath: join(
      __dirname,
      "../../../src/hb-backend-api/outbox/infra/grpc/outbox.proto",
    ),
    url: "0.0.0.0:50051",
  },
};
