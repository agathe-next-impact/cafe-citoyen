import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

/**
 * API Route: Exit Preview Mode
 * 
 * This endpoint disables draft mode and redirects the user
 * to the homepage or a specified URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirect') || '/';

  // Disable Draft Mode
  const draft = await draftMode();
  draft.disable();

  // Redirect to the specified URL or homepage
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
