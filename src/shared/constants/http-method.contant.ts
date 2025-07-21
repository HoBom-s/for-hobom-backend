export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export function convertToHttpMethod(method: string): HttpMethod {
  const upper = method.toUpperCase();

  if (upper in HttpMethod) {
    return upper as HttpMethod;
  }

  throw new Error(`Unsupported HTTP method: ${method}`);
}
