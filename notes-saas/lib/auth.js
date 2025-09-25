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
    return null;
  }
}

// Middleware for Next.js App Router API routes
export function requireAuth(handler) {
  return async (req) => {
    const authHeader = req.headers.get('authorization'); // App Router style
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    req.user = decoded; // attach user info
    return handler(req); // pass req to handler, must return Response
  };
}
export function setToken(token) {
  if (typeof window !== 'undefined') localStorage.setItem('token', token);
}

export function getToken() {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
}
