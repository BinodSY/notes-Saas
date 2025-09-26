import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req) => {
  const notes = await prisma.note.findMany({
    where: { tenantId: req.user.tenantId },
    orderBy: { createdAt: 'desc' },
    include: { tenant: true }, // Include tenant details
  });

  return new Response(JSON.stringify(notes), { status: 200 });
});

// Get a specific note by ID
export const GET_BY_ID = requireAuth(async (req) => {
  const { id } = req.params || {};

  if (!id) {
    return new Response(JSON.stringify({ error: 'Note ID is required.' }), { status: 400 });
  }

  const note = await prisma.note.findFirst({
    where: {
      id: Number(id),
      tenantId: req.user.tenantId,
    },
    include: { tenant: true },
  });

  if (!note) {
    return new Response(JSON.stringify({ error: 'Note not found or access denied.' }), { status: 404 });
  }

  return new Response(JSON.stringify(note), { status: 200 });
});



// Update a note
export const PUT = requireAuth(async (req) => {
  const { id, title, content } = await req.json();

  // Find the note and ensure it belongs to the user's tenant
  const note = await prisma.note.findFirst({
    where: {
      id: Number(id),
      tenantId: req.user.tenantId,
    },
  });

  if (!note || note.tenantId !== req.user.tenantId) {
    return new Response(JSON.stringify({ error: 'Note not found or access denied.' }), { status: 404 });
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: { title, content },
  });

  return new Response(JSON.stringify(updatedNote), { status: 200 });
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
