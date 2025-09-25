export async function GET(req, res) {
  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
}
