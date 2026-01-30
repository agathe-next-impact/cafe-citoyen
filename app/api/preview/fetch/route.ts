import { NextRequest, NextResponse } from 'next/server';
import { fetchDraftPost } from '@/lib/wordpress-api';

/**
 * API Route: Fetch Preview Content
 * 
 * This endpoint fetches the latest preview content for a post.
 * It's used by the PreviewProvider for polling updates.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const id = searchParams.get('id');
  const postType = searchParams.get('postType') || 'post';
  const token = searchParams.get('token');

  if (!id) {
    return NextResponse.json(
      { message: 'Missing required parameter: id' },
      { status: 400 }
    );
  }

  try {
    const post = await fetchDraftPost({
      id,
      postType,
      token: token || undefined,
    });

    if (!post) {
      return NextResponse.json(
        { message: 'Post not found', post: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      post,
      postType,
      isPreview: true,
    });
  } catch (error) {
    console.error('Error fetching preview:', error);
    return NextResponse.json(
      { message: 'Error fetching preview', error: String(error) },
      { status: 500 }
    );
  }
}
