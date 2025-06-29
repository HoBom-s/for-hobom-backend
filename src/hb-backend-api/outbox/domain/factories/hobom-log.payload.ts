import { TraceInfoConstant } from "../../../../shared/constants/trace-info.constant";
import { HttpMethod } from "../../../../shared/constants/http-method.contant";

export interface HoBomLogPayloadType {
  traceId: string;
  level: TraceInfoConstant;
  method: HttpMethod;
  path: string;
  statusCode: number;
  host: string;
  userId: string;
  serviceType: string;
  message: string;
  payload: {
    query?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, any>;
    error?: string;
  };
}

export function createHoBomLogPayload(
  input: HoBomLogPayloadType,
): Record<string, string | number | Record<string, any>> {
  return {
    traceId: input.traceId,
    level: input.level,
    method: input.method,
    path: input.path,
    statusCode: input.statusCode,
    host: input.host,
    userId: input.userId,
    serviceType: input.serviceType,
    message: input.message,
    payload: input.payload,
  };
}
