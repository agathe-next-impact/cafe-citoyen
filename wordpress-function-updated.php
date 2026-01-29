function get_site_reglages() {
    // Récupérer les champs ACF depuis la page d'options
    $titre = get_field('titre_du_site', 'option');
    $description = get_field('description_du_site', 'option');
    $logo = get_field('logo_du_site', 'option');
    $reseaux_sociaux = get_field('reseaux_sociaux', 'option');
    
    // Préparer le logo avec toutes les informations utiles
    $logo_data = null;
    if ($logo) {
        $logo_data = array(
            'ID' => $logo['ID'],
            'url' => $logo['url'],
            'alt' => $logo['alt'],
            'title' => $logo['title'] ?? '',
            'width' => $logo['width'],
            'height' => $logo['height'],
            'sizes' => array(
                'thumbnail' => $logo['sizes']['thumbnail'] ?? null,
                'medium' => $logo['sizes']['medium'] ?? null,
                'large' => $logo['sizes']['large'] ?? null,
            )
        );
    }
    
    // Préparer les réseaux sociaux
    $reseaux_sociaux_data = array();
    if ($reseaux_sociaux && is_array($reseaux_sociaux)) {
        foreach ($reseaux_sociaux as $reseau) {
            $icone = $reseau['icone'] ?? null;
            $icone_data = null;
            
            if ($icone) {
                $icone_data = array(
                    'ID' => $icone['ID'],
                    'url' => $icone['url'],
                    'alt' => $icone['alt'] ?? '',
                    'title' => $icone['title'] ?? '',
                    'width' => $icone['width'] ?? null,
                    'height' => $icone['height'] ?? null,
                );
            }
            
            $reseaux_sociaux_data[] = array(
                'icone' => $icone_data,
                'lien' => $reseau['lien'] ?? '',
            );
        }
    }
    
    // Retourner les données
    return new WP_REST_Response(array(
        'success' => true,
        'data' => array(
            'titre_du_site' => $titre ?: '',
            'description_du_site' => $description ?: '',
            'logo_du_site' => $logo_data,
            'reseaux_sociaux' => $reseaux_sociaux_data,
        )
    ), 200);
}
