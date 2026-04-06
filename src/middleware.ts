import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required by Supabase SSR
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Public paths — no auth required
  const publicPaths = [
    "/", "/login", "/signup", "/auth/",
    "/privacy", "/terms", "/pro",
  ];
  const isPublic =
    publicPaths.some((p) => pathname === p || pathname.startsWith(p)) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/spots") ||
    pathname.startsWith("/fish") ||
    pathname.startsWith("/anglers") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/explore") ||
    pathname.startsWith("/forecast");

  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Onboarding check is handled in individual pages — not here —
  // to avoid DB queries in the Edge runtime.

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
