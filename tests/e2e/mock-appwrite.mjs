// Minimal in-memory stand-in for the Appwrite REST endpoints this app uses, so
// end-to-end tests run the real server code without a live Appwrite project.
// Test-only control endpoints: POST /__reset, POST /__seed, GET /__state.

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_APPWRITE_PORT ?? 4010);
export const VALID_OTP = "123456";

let state;
const reset = () => {
  state = { users: [], rows: {}, sms: [], sessions: 0 };
};
reset();

const now = () => new Date().toISOString();
const id = () => randomUUID().replace(/-/g, "").slice(0, 20);
const table = (tableId) => (state.rows[tableId] ??= []);
const fail = (code, message) => ({ status: code, body: { message, code, type: "mock_error" } });
const ok = (body, status = 200) => ({ status, body });

function readQueries(url) {
  const queries = [];
  for (const [key, value] of url.searchParams)
    if (key.startsWith("queries[")) queries.push(JSON.parse(value));
  return queries;
}

function applyQueries(rows, queries, expand) {
  let result = rows.slice();
  let limit = 25;
  for (const q of queries) {
    const v = q.values ?? [];
    const get = (row) => row[q.attribute];
    switch (q.method) {
      case "equal":
        result = result.filter((r) => v.includes(get(r)));
        break;
      case "notEqual":
        result = result.filter((r) => !v.includes(get(r)));
        break;
      case "greaterThanEqual":
        result = result.filter((r) => new Date(get(r)) >= new Date(v[0]));
        break;
      case "lessThan":
        result = result.filter((r) => new Date(get(r)) < new Date(v[0]));
        break;
      case "between":
        result = result.filter(
          (r) => new Date(get(r)) >= new Date(v[0]) && new Date(get(r)) <= new Date(v[1])
        );
        break;
      case "orderDesc":
        result.sort((a, b) => String(get(b)).localeCompare(String(get(a))));
        break;
      case "limit":
        limit = v[0];
        break;
      default:
        break; // select etc.
    }
  }
  return { total: result.length, rows: result.slice(0, limit).map(expand) };
}

// Mirrors the appointment → patient relationship being loaded via Query.select(["*", "patient.*"]).
const expandRow = (row) =>
  typeof row.patient === "string"
    ? {
        ...row,
        patient:
          Object.values(state.rows)
            .flat()
            .find((p) => p.$id === row.patient) ?? row.patient,
      }
    : row;

const newRow = (data, rowId) => ({
  $id: rowId === "unique()" || !rowId ? id() : rowId,
  $createdAt: now(),
  $updatedAt: now(),
  ...data,
});
const newUser = (u) => ({
  $id: u.$id ?? id(),
  $createdAt: now(),
  name: "",
  phone: "",
  email: "",
  ...u,
});

function route(method, path, url, body) {
  let m;
  // ---- test control ----
  if (method === "POST" && path === "/__reset") return (reset(), ok({}));
  if (method === "POST" && path === "/__seed") {
    for (const u of body.users ?? []) state.users.push(newUser(u));
    for (const [t, rows] of Object.entries(body.rows ?? {}))
      for (const r of rows) table(t).push(newRow(r, r.$id));
    return ok({});
  }
  if (method === "GET" && path === "/__state") return ok(state);

  // ---- account (email OTP) ----
  if (method === "POST" && path === "/v1/account/tokens/email") {
    let user = state.users.find((u) => u.email === body.email);
    if (!user)
      state.users.push(
        (user = newUser({
          $id: body.userId === "unique()" ? id() : body.userId,
          email: body.email,
        }))
      );
    return ok({ $id: id(), userId: user.$id, secret: "", expire: now() }, 201);
  }
  if (method === "POST" && path === "/v1/account/sessions/token") {
    if (body.secret !== VALID_OTP) return fail(401, "Invalid token passed in the request.");
    state.sessions++;
    return ok({ $id: id(), userId: body.userId }, 201);
  }

  // ---- users ----
  if ((m = path.match(/^\/v1\/users\/([^/]+)\/sessions\/([^/]+)$/)) && method === "DELETE")
    return ok({}, 204);
  if ((m = path.match(/^\/v1\/users\/([^/]+)\/(name|phone)$/)) && method === "PATCH") {
    const user = state.users.find((u) => u.$id === m[1]);
    if (!user) return fail(404, "User not found");
    if (m[2] === "name") user.name = body.name;
    else user.phone = body.number;
    return ok(user);
  }
  if ((m = path.match(/^\/v1\/users\/([^/]+)$/)) && method === "GET") {
    const user = state.users.find((u) => u.$id === m[1]);
    return user ? ok(user) : fail(404, "User not found");
  }

  // ---- tablesdb rows ----
  if ((m = path.match(/^\/v1\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows$/))) {
    if (method === "GET") return ok(applyQueries(table(m[1]), readQueries(url), expandRow));
    if (method === "POST") {
      const row = newRow(body.data, body.rowId);
      table(m[1]).push(row);
      return ok(row, 201);
    }
  }
  if ((m = path.match(/^\/v1\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)$/))) {
    const row = table(m[1]).find((r) => r.$id === m[2]);
    if (!row) return fail(404, "Row not found");
    if (method === "GET") return ok(expandRow(row));
    if (method === "PATCH") return ok(Object.assign(row, body.data, { $updatedAt: now() }));
  }

  // ---- messaging ----
  if (method === "POST" && path === "/v1/messaging/messages/sms") {
    state.sms.push({ users: body.users, content: body.content });
    return ok({ $id: id() }, 201);
  }

  return fail(404, `Mock route not implemented: ${method} ${path}`);
}

createServer((req, res) => {
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let body = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {}
    const { status, body: out } = route(req.method, url.pathname, url, body);
    res.writeHead(status, { "content-type": "application/json" });
    res.end(status === 204 ? undefined : JSON.stringify(out));
  });
}).listen(PORT, () => console.log(`mock appwrite listening on ${PORT}`));
