const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
    if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET no está definido");
        throw new Error("Falta JWT_SECRET en variables de entorno");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization || "";

        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: "Token faltante." });
        }

        const payload = verifyToken(token);

        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            name: payload.name
        };

        next();
    } catch (err) {

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expirado." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido." });
        }

        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};