import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  let token = req.cookies.token;

  // Fallback to Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}

function generateToken(data) {
  // Will generate token using user info and server secret key
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "5h" });
}

const JWT = {
  verifyToken,
  generateToken,
};

export default JWT;
