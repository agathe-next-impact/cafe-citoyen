import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { validatePreviewSecret, fetchPreviewPost, getPostTypeEndpointAsync } from '@/lib/wordpress-api';

/**
 * API Route: Enable Preview Mode
 * 
 * This endpoint is called by WordPress when a user clicks "Preview" in the editor.
 * It validates the request and redirects to the preview page with draft mode enabled.
 * 
 * Expected query parameters:
 * - secret: The preview secret token (must match WP_PREVIEW_SECRET)
 * - id: The post/page ID
 * - postType: The post type (post, page, or custom post type)
 * - slug: Optional slug for the redirect URL
 * - token: Optional JWT token for authenticated requests
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');
  const postType = searchParams.get('postType') || searchParams.get('post_type') || 'post';
  const slug = searchParams.get('slug');
  const token = searchParams.get('token');
  const previewPath = searchParams.get('previewPath');

  // Validate required parameters
  if (!id) {
    return NextResponse.json(
      { message: 'Missing required parameter: id' },
      { status: 400 }
    );
  }

  // Validate the preview secret
  if (!validatePreviewSecret(secret || undefined)) {
    return NextResponse.json(
      { message: 'Invalid preview secret' },
      { status: 401 }
    );
  }

  // Fetch the post to verify it exists
  const post = await fetchPreviewPost({
    id,
    postType,
    token: token || undefined,
  });

  if (!post) {
    const endpoint = await getPostTypeEndpointAsync(postType);
    return NextResponse.json(
      { 
        message: 'Post not found',
        debug: {
          id,
          postType,
          endpoint,
          apiUrl: `${process.env.WORDPRESS_API_URL}/wp/v2/${endpoint}/${id}`,
          hint: 'Vérifiez que le CPT est exposé dans l\'API REST WordPress (show_in_rest = true)'
        }
      },
      { status: 404 }
    );
  }

  // Enable Draft Mode
  const draft = await draftMode();
  draft.enable();

  // Build the redirect URL based on post type
  let redirectUrl = '/';
  const postSlug = slug || post.slug;
  const sanitizedPreviewPath = normalizePreviewPath(previewPath);

  if (sanitizedPreviewPath) {
    redirectUrl = sanitizedPreviewPath;
  } else {
    switch (postType) {
      case 'post':
        redirectUrl = `/blog/${postSlug}`;
        break;
      case 'page':
        redirectUrl = `/${postSlug}`;
        break;
      default:
        // Custom post types
        redirectUrl = `/${postType}/${postSlug}`;
        break;
    }
  }

  // Add preview query parameters
  const previewUrl = new URL(redirectUrl, request.url);
  previewUrl.searchParams.set('preview', 'true');
  previewUrl.searchParams.set('id', id);
  previewUrl.searchParams.set('postType', postType);
  if (token) {
    previewUrl.searchParams.set('token', token);
  }

  // Redirect to the preview page
  return NextResponse.redirect(previewUrl);
}

function normalizePreviewPath(path: string | null): string | null {
  if (!path) {
    return null;
  }
  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
