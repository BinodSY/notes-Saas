import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req) => {
  const notes = await prisma.note.findMany({
    where: { tenantId: req.user.tenantId },
    orderBy: { createdAt: 'desc' },
  });

  return new Response(JSON.stringify(notes), { status: 200 });
});

export const POST = requireAuth(async (req) => {
  const { title, content } = await req.json();

  // Fetch tenant plan
  const tenant = await prisma.tenant.findUnique({ where: { id: req.user.tenantId } });

  // Enforce Free plan limit
  if (tenant.plan === 'free') {
    const noteCount = await prisma.note.count({ where: { tenantId: tenant.id } });
    if (noteCount >= 3) {
      return new Response(JSON.stringify({ error: 'Free plan limit reached. Upgrade to Pro.' }), { status: 403 });
    }
  }

  const note = await prisma.note.create({
    data: {
      title,
      content,
      tenantId: tenant.id,
      authorId: req.user.userId,
    },
  });

  return new Response(JSON.stringify(note), { status: 201 });
});
