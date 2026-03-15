export interface PatchMessageOutboxFailedRequest {
  eventId: string;
  errorMessage: string;
}
