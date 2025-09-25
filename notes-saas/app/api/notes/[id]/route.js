import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (req) => {
  const { id } = req.params;

  const note = await prisma.note.findUnique({ where: { id: parseInt(id) } });
  if (!note || note.tenantId !== req.user.tenantId) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(note), { status: 200 });
});

export const PUT = requireAuth(async (req) => {
  const { id } = req.params;
  const { title, content } = await req.json();

  const note = await prisma.note.findUnique({ where: { id: parseInt(id) } });
  if (!note || note.tenantId !== req.user.tenantId) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  // Members and Admins can update notes
  const updatedNote = await prisma.note.update({
    where: { id: parseInt(id) },
    data: { title, content },
  });

  return new Response(JSON.stringify(updatedNote), { status: 200 });
});

export const DELETE = requireAuth(async (req) => {
  const { id } = req.params;

  const note = await prisma.note.findUnique({ where: { id: parseInt(id) } });
  if (!note || note.tenantId !== req.user.tenantId) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  await prisma.note.delete({ where: { id: parseInt(id) } });

  return new Response(JSON.stringify({ message: 'Note deleted' }), { status: 200 });
});
