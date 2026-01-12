<?php
/*
Plugin Name: Posts Preview
Description: Prévisualisation sécurisée et adaptable des posts, pages et CPT sur le front via un bouton dans l’admin. URLs dynamiques via variables d'environnement.
Version: 1.1
Author: Next Impact 
Author URI: https://next-impact.digital
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html

*/

// Nettoyage à la désactivation du plugin : supprime les options et évite les doublons de boutons
register_deactivation_hook(__FILE__, function() {
    delete_option('posts_preview_frontend_url');
    delete_option('posts_preview_secret');
});

// Ajoute un lien 'Réglages' dans la liste des extensions
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
    $settings_link = '<a href="options-general.php?page=posts-preview-options">Réglages</a>';
    array_unshift($links, $settings_link);
    return $links;
});

// Autorise l'accès à l'API REST pour les statuts non-publics si le bon token est fourni
add_filter('rest_page_query', function($args, $request) {
    $preview_secret = get_option('posts_preview_secret', getenv('PREVIEW_SECRET') ?: (defined('PREVIEW_SECRET') ? PREVIEW_SECRET : 'devtoken'));
    $token = $request->get_param('secret');
    if ($token && $token === $preview_secret) {
        if (isset($args['status']) && $args['status'] === 'any') {
            $args['post_status'] = array('publish', 'draft', 'pending', 'future', 'private');
        }
    }
    return $args;
}, 10, 2);

add_filter('rest_post_query', function($args, $request) {
    $preview_secret = get_option('posts_preview_secret', getenv('PREVIEW_SECRET') ?: (defined('PREVIEW_SECRET') ? PREVIEW_SECRET : 'devtoken'));
    $token = $request->get_param('secret');
    if ($token && $token === $preview_secret) {
        if (isset($args['status']) && $args['status'] === 'any') {
            $args['post_status'] = array('publish', 'draft', 'pending', 'future', 'private');
        }
    }
    return $args;
}, 10, 2);

// Supprime le bouton de prévisualisation natif de WordPress (éditeur classique) pour tous les post types publics
add_filter('preview_post_link', function($preview_link, $post) {
    $post_types = get_post_types(['public' => true, 'show_ui' => true], 'names');
    if (isset($post->post_type) && in_array($post->post_type, $post_types)) {
        return '';
    }
    return $preview_link;
}, 10, 2);

// Supprime le bouton de preview natif dans Gutenberg (éditeur bloc) pour tous les post types publics
add_action('admin_head', function() {
    $screen = get_current_screen();
    $post_types = get_post_types(['public' => true, 'show_ui' => true], 'names');
    if ($screen && in_array($screen->post_type, $post_types)) {
        echo '<style>.edit-post-header__settings .components-button.is-secondary[href*="preview"] { display: none !important; }</style>';
    }
});


// Ajoute une page d'options pour configurer les variables FRONTEND_URL et PREVIEW_SECRET
add_action('admin_menu', function() {
    add_options_page('Posts Preview', 'Posts Preview', 'manage_options', 'posts-preview-options', function() {
        if (isset($_POST['posts_preview_save'])) {
            update_option('posts_preview_frontend_url', sanitize_text_field($_POST['posts_preview_frontend_url']));
            update_option('posts_preview_secret', sanitize_text_field($_POST['posts_preview_secret']));
            echo '<div class="updated"><p>Options enregistrées.</p></div>';
        }
        // Suppression du bouton de génération de token
        $frontend_url = get_option('posts_preview_frontend_url', getenv('FRONTEND_URL') ?: (defined('FRONTEND_URL') ? FRONTEND_URL : 'https://wordpress-starter.fr'));
        $preview_secret = get_option('posts_preview_secret', getenv('PREVIEW_SECRET') ?: (defined('PREVIEW_SECRET') ? PREVIEW_SECRET : 'devtoken'));
        echo '<div class="wrap"><h1>Configuration Posts Preview</h1>';
        echo '<form method="post">';
        echo '<table class="form-table"><tr><th scope="row">URL du front-end</th><td><input type="text" name="posts_preview_frontend_url" value="' . esc_attr($frontend_url) . '" class="regular-text" /></td></tr>';
        echo '<tr><th scope="row">Preview Secret (token)</th><td><input type="text" name="posts_preview_secret" value="' . esc_attr($preview_secret) . '" class="regular-text" /></td></tr></table>';
        echo '<p class="submit"><input type="submit" name="posts_preview_save" class="button-primary" value="Enregistrer" /></p>';
        echo '</form></div>';
    });
});

// Ajoute le bouton custom de preview sécurisé (éditeur classique et tous CPT)
add_action('post_submitbox_misc_actions', function() {
    global $post;
    if (!$post) return;
    $post_types = get_post_types(['public' => true, 'show_ui' => true], 'names');
    if (!in_array($post->post_type, $post_types)) return;
    $frontend_url = get_option('posts_preview_frontend_url', getenv('FRONTEND_URL') ?: (defined('FRONTEND_URL') ? FRONTEND_URL : 'https://wordpress-starter.fr'));
    $preview_secret = get_option('posts_preview_secret', getenv('PREVIEW_SECRET') ?: (defined('PREVIEW_SECRET') ? PREVIEW_SECRET : 'devtoken'));
    $slug = $post->post_name ? $post->post_name : $post->ID;
    $preview_url = trailingslashit($frontend_url) . 'api/preview?secret=' . urlencode($preview_secret) . '&slug=' . urlencode($slug);
    echo '<div class="misc-pub-section">';
    echo '<a href="' . esc_url($preview_url) . '" target="_blank" class="button button-primary" style="width:100%;text-align:center;">Prévisualiser sur le site (secure)</a>';
    echo '</div>';
});
