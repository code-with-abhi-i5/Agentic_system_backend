import jwt from "jsonwebtoken";

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token !== "null" && token !== "undefined") {
        try {
          const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
          req.user = {
            userId: decoded.userId,
          };
        } catch (e) {
          // Token expired or invalid, proceed as guest
          req.user = null;
        }
      }
    }
  } catch (err) {
    req.user = null;
  }
  next();
};
