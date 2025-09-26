import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

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
