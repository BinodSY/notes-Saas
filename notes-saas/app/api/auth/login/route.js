import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 401 });
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });

  const token = generateToken(user);
  return new Response(JSON.stringify({ token }), { status: 200 });
}
