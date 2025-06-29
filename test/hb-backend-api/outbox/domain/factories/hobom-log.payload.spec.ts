import { createHoBomLogPayload } from "../../../../../src/hb-backend-api/outbox/domain/factories/hobom-log.payload";
import { TraceInfoConstant } from "../../../../../src/shared/constants/trace-info.constant";
import {
  convertToHttpMethod,
  HttpMethod,
} from "../../../../../src/shared/constants/http-method.contant";
import { HOBO_BACKEND_SERVICE_TYPE } from "../../../../../src/shared/constants/service-type.constant";

describe("hobom-log.payload", () => {
  describe("createHoBomLogPayload()", () => {
    it("should return an today menu payload object", () => {
      const result = createHoBomLogPayload({
        traceId: "trace-id-1234",
        level: TraceInfoConstant.WARN,
        method: convertToHttpMethod(HttpMethod.PATCH),
        path: "/path/today-menu",
        statusCode: 200,
        host: "hobom",
        userId: "user-id",
        payload: {
          query: {
            nickname: "robin",
          },
          body: {
            menu: "menu",
          },
          headers: {
            "cache-control": "no-cache",
          },
        },
        serviceType: HOBO_BACKEND_SERVICE_TYPE,
        message: "message",
      });

      expect(result).toStrictEqual({
        traceId: "trace-id-1234",
        level: TraceInfoConstant.WARN,
        method: convertToHttpMethod(HttpMethod.PATCH),
        path: "/path/today-menu",
        statusCode: 200,
        host: "hobom",
        userId: "user-id",
        payload: {
          query: {
            nickname: "robin",
          },
          body: {
            menu: "menu",
          },
          headers: {
            "cache-control": "no-cache",
          },
        },
        serviceType: HOBO_BACKEND_SERVICE_TYPE,
        message: "message",
      });
    });
  });
});
