import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const roleRoutes: Record<string, string[]> = {
  "/": ["ADMIN", "SUPERVISOR"],
  "/builds": ["ADMIN", "SUPERVISOR"],
  "/library": ["ADMIN"],
  "/builder": ["ADMIN", "SUPERVISOR", "BUILDER"],
};

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — redirect to login
  if (!user && !request.nextUrl.pathname.startsWith("/login") &&
      !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in — check role-based access
  if (user) {
    const { data: profile } = await supabase
      .from("User")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const pathname = request.nextUrl.pathname;

    // Find matching route
    const matchedRoute = Object.keys(roleRoutes).find(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    if (matchedRoute && role && !roleRoutes[matchedRoute].includes(role)) {
      // Role not allowed — redirect to appropriate default page
      const url = request.nextUrl.clone();
      url.pathname = role === "BUILDER" ? "/builder" : "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
