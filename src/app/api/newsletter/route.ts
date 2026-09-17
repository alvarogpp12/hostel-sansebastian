/**
 * Newsletter subscription — NOT CONNECTED YET.
 *
 * The reference posts to a Brevo (Sendinblue) form. Plug the client's provider
 * in here (Brevo, Mailchimp, Resend Audiences…) using a server-side API key
 * from an environment variable, then return 200.
 */
export async function POST(request: Request) {
  const data = await request.formData();
  const email = String(data.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !data.get("consent")) {
    return Response.json({ message: "Introduce un email válido y acepta la política de privacidad." }, { status: 400 });
  }
  return Response.json(
    { message: "La suscripción todavía no está conectada a ningún proveedor de email (integración pendiente)." },
    { status: 501 },
  );
}
