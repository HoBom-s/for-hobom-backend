import { join } from "path";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

/**
 * [ADR] gRPC 마이크로서비스 설정
 *
 * ## 왜 gRPC인가?
 *
 * 이 서비스는 REST API(포트 8080)와 gRPC(포트 50051)를 동시에 운영한다.
 * REST는 외부 클라이언트(앱/웹)용, gRPC는 내부 서비스 간 통신용이다.
 *
 * ### gRPC 선택 이유
 *
 * 1. **Transactional Outbox 패턴의 consumer 분리**
 *    - 이 서비스는 모든 상태 변경을 outbox 컬렉션에 기록한다 (CDC 패턴).
 *    - 별도의 consumer 서비스(hobom-log-consumer 등)가 주기적으로 polling한다.
 *    - consumer들이 gRPC로 pending 이벤트를 조회하고, 처리 후 SENT로 갱신한다.
 *
 * 2. **REST 대비 gRPC의 장점 (내부 서비스 통신)**
 *    - Protocol Buffers: 강타입 계약(contract-first), 스키마 변경 감지 가능
 *    - 성능: JSON 대비 바이너리 인코딩으로 payload 크기 절감
 *    - 코드 생성: proto 파일로부터 클라이언트/서버 코드 자동 생성 → 타입 안전성 보장
 *
 * 3. **REST를 쓰지 않은 이유**
 *    - 내부 서비스 간 통신에 REST를 쓰면 버전 관리와 계약 명세가 암묵적이 된다.
 *    - gRPC proto 파일이 명시적 인터페이스 계약서 역할을 한다.
 *
 * ### 서비스 구조
 *   [REST Client (앱/웹)]
 *       ↓ HTTP (포트 8080)
 *   [hobom-backend] → outbox 컬렉션에 이벤트 저장
 *       ↑ gRPC (포트 50051)
 *   [Consumer Services]
 *     - FindOutboxByEventTypeAndStatus로 pending 이벤트 polling
 *     - PatchOutboxMarkAsSent로 처리 완료 표시
 *
 * ### proto 파일 위치
 * hobom-buf-proto/ (git submodule) 에서 관리한다.
 * 서버와 consumer 모두 동일한 submodule을 참조하여 계약 일관성을 유지한다.
 */
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
