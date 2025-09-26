import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const POST = requireAuth(async (req, { params }) => {
  const { slug } = params; // ✅ this is how we get [slug] in Next.js
  const { email, role, password } = await req.json();

  // Only Admins can invite
  if (req.user.role !== 'Admin') {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Admin only' }),
      { status: 403 }
    );
  }

  // Find tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug: String(slug) },
  });
  if (!tenant) {
    return new Response(
      JSON.stringify({ error: 'Tenant not found' }),
      { status: 404 }
    );
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      role,
      password: hashedPassword,
      tenantId: tenant.id,
    },
  });

  return new Response(
    JSON.stringify({ message: 'User invited', userId: user.id }),
    { status: 201 }
  );
});
