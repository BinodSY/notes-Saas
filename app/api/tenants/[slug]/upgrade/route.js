import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
export const POST = requireAuth(async (req, { params }) => {
  console.log("Upgrade endpoint hit with params:", params, "user:", req.user);
  const { slug } = params;

  if (req.user.role !== 'Admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  if (req.user.tenantSlug !== slug) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  await prisma.tenant.update({
    where: { slug },
    data: { plan: 'pro' },
  });

  return new Response(JSON.stringify({ message: 'Tenant upgraded to Pro' }), { status: 200 });
});


// Invite a user to the tenant
export const inviteUser = requireAuth(async (req, { params }) => {
  const { slug } = params;
  const { email, role, password } = await req.json();


  // Only Admin can invite users
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug: String(slug) } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  // Create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      role,
      password: hashedPassword,
      tenantId: tenant.id,
    },
  });

  return res.status(201).json({ message: 'User invited', userId: user.id });
});