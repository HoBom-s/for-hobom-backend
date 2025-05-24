import { AsyncLocalStorage } from "async_hooks";
import { ClientSession } from "mongoose";

const sessionStorage = new AsyncLocalStorage<ClientSession>();

export const MongoSessionContext = {
  runWithSession: <T>(session: ClientSession, fn: () => Promise<T>) => {
    return sessionStorage.run(session, fn);
  },
  getSession: (): ClientSession | undefined => {
    return sessionStorage.getStore();
  },
} as const;
