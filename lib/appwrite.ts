import "server-only";

import { Account, Client, Messaging, Storage, TablesDB, Users } from "node-appwrite";

import { env } from "./env";

let services:
  | {
      account: Account;
      tables: TablesDB;
      users: Users;
      messaging: Messaging;
      storage: Storage;
    }
  | undefined;

/** Server-side Appwrite services, authenticated with the API key. Never import from client code. */
export function appwrite() {
  if (services) return services;

  const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = env();
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  services = {
    // Admin-keyed Account is the documented SSR pattern for email OTP (token → session).
    account: new Account(client),
    tables: new TablesDB(client),
    users: new Users(client),
    messaging: new Messaging(client),
    storage: new Storage(client),
  };
  return services;
}
