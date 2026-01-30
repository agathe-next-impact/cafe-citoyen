// pages/api/revalidate.js

export default async function handler(req, res) {
  // 1. Vérifier le jeton de sécurité secret
  if (req.query.secret !== process.env.MY_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Token invalide' });
  }

  try {
    // 2. Récupérer le chemin à revalider (ex: /blog/mon-article)
    const pathToRevalidate = req.query.path;
    
    if (!pathToRevalidate) {
      return res.status(400).json({ message: 'Le paramètre path est requis' });
    }

    // 3. Déclencher la purge du cache pour ce chemin
    await res.revalidate(pathToRevalidate);
    
    return res.json({ revalidated: true });
  } catch (err) {
    // Si une erreur survient, Next.js continuera de servir l'ancien cache
    return res.status(500).send('Erreur lors de la revalidation');
  }
}