const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    // 1. Check if Authorization header exists and starts with "Bearer"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided. Access denied." });
    }

    // 2. Extract the token (strip out the "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    // 3. Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded user id to req.user so routes can use it
    req.user = { id: decoded.id };

    // 5. Pass control to the next middleware or route handler
    next();
  } catch (error) {
    // jwt.verify throws if token is expired or tampered with
    return res.status(401).json({ message: "Invalid or expired token. Access denied." });
  }
};

module.exports = protect;
