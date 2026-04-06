import jwt from "jsonwebtoken";
import { Admin } from "../models/index.js";
import { env } from "../config/env.js";
import { verifyPassword } from "../utils/password.js";

export async function loginAdmin(req, res) {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  try {
    const adminRecord = await Admin.findOne({ where: { username } });
    if (!adminRecord) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await verifyPassword(password, adminRecord.password_hash);
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

    return res.json({
      token,
      admin: {
        id: adminRecord.id,
        username: adminRecord.username,
      },
    });
  } catch (error) {
    const mysqlErrorCode = error?.parent?.code || error?.original?.code;
    if (mysqlErrorCode === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({
        message:
          "Database tables are missing. From the backend folder run: npm run db:schema && npm run db:seed-admin",
      });
    }
    throw error;
  }
}
