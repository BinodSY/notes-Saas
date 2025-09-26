import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      tenantSlug: user.tenant.slug,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

// Middleware for Next.js App Router API routes
export function requireAuth(handler) {
  return async (req, context) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    req.user = decoded;
    return handler(req, context); // 🔑 forward context (so params work)
  };
}


export function setToken(token) {
  if (typeof window !== 'undefined') localStorage.setItem('token', token);
}

export function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem('token');
}