
import { getWordPressPosts } from "@/lib/wordpress-api";

export async function getPosts() {
  return getWordPressPosts();
}

// Recherche un post par son slug dans la liste des posts
export async function getPost(slug: string) {
  const posts = await getWordPressPosts();
  return posts.find(post => post.slug === slug) || null;
}
