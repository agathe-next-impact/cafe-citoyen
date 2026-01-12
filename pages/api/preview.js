export default function handler(req, res) {
  const { secret, slug } = req.query;

  // Vérifiez le token secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Vérifiez le slug
  if (!slug) {
    return res.status(400).json({ message: 'Missing slug' });
  }

  // Active le mode preview et redirige vers la page correspondante
  res.setPreviewData({});
  res.writeHead(307, { Location: `/${slug}` });
  res.end();
}

// Supprimez le body JSON et le header content-length côté client : 
// Lors de l'appel GET, n'envoyez pas de body ni de content-length.

// Ajoutez ceci dans preview.js pour debug temporaire
console.log('PREVIEW_SECRET:', process.env.PREVIEW_SECRET);