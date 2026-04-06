import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";
import { env } from "../config/env.js";
import { verifyPassword } from "../utils/password.js";

export async function loginAdmin(req, res) {
  const username = req.body?.username;
  const password = req.body?.password;

  // #region agent log
  fetch("http://127.0.0.1:7624/ingest/11d329a9-994d-4584-8e9f-2a898b8af697", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a3da39" },
    body: JSON.stringify({
      sessionId: "a3da39",
      hypothesisId: "D",
      location: "auth.controller.js:loginAdmin:entry",
      message: "login request received",
      data: {
        hasBody: Boolean(req.body),
        usernameType: typeof username,
        passwordType: typeof password,
        usernameLength: typeof username === "string" ? username.length : null,
        passwordLength: typeof password === "string" ? password.length : null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!username || !password) {
    // #region agent log
    fetch("http://127.0.0.1:7624/ingest/11d329a9-994d-4584-8e9f-2a898b8af697", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a3da39" },
      body: JSON.stringify({
        sessionId: "a3da39",
        hypothesisId: "D",
        location: "auth.controller.js:loginAdmin:rejectMissing",
        message: "missing username or password",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return res.status(400).json({ message: "username and password are required" });
  }

  const adminRecord = await Admin.findOne({ where: { username } });
  // #region agent log
  fetch("http://127.0.0.1:7624/ingest/11d329a9-994d-4584-8e9f-2a898b8af697", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a3da39" },
    body: JSON.stringify({
      sessionId: "a3da39",
      hypothesisId: "A",
      location: "auth.controller.js:loginAdmin:afterFindOne",
      message: "admin lookup result",
      data: {
        adminFound: Boolean(adminRecord),
        adminId: adminRecord ? adminRecord.id : null,
        hashPrefix: adminRecord?.password_hash ? String(adminRecord.password_hash).slice(0, 4) : null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!adminRecord) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const passwordMatches = await verifyPassword(password, adminRecord.password_hash);
  // #region agent log
  fetch("http://127.0.0.1:7624/ingest/11d329a9-994d-4584-8e9f-2a898b8af697", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a3da39" },
    body: JSON.stringify({
      sessionId: "a3da39",
      hypothesisId: "B",
      location: "auth.controller.js:loginAdmin:afterVerify",
      message: "password verification",
      data: { passwordMatches },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { username: adminRecord.username },
    env.jwtSecret,
    {
      subject: String(adminRecord.id),
      expiresIn: env.jwtExpiresIn,
    },
  );

  // #region agent log
  fetch("http://127.0.0.1:7624/ingest/11d329a9-994d-4584-8e9f-2a898b8af697", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a3da39" },
    body: JSON.stringify({
      sessionId: "a3da39",
      hypothesisId: "E",
      location: "auth.controller.js:loginAdmin:success",
      message: "login issuing token",
      data: { tokenLength: typeof token === "string" ? token.length : null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return res.json({
    token,
    admin: {
      id: adminRecord.id,
      username: adminRecord.username,
    },
  });
}
