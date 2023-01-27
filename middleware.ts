// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(
    "🚀🚀🚀 ~ middleware ~ pathname",
    pathname,
    `/no-variant${pathname}`
  );
  return NextResponse.rewrite(new URL(`/no-variant${pathname}`, request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/", "/shop", "/product", "/who-we-are", "/about", "/contact"],
};
