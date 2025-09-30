import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("pt_jwt");
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
  });
}
