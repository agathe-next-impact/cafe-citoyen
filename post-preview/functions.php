<?php
/**
 * Cafe citoyen functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Cafe_citoyen
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '1.0.0' );
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function cafe_citoyen_setup() {
	/*
		* Make theme available for translation.
		* Translations can be filed in the /languages/ directory.
		* If you're building a theme based on Cafe citoyen, use a find and replace
		* to change 'cafe-citoyen' to the name of your theme in all the template files.
		*/
	load_theme_textdomain( 'cafe-citoyen', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
	add_theme_support( 'title-tag' );

	/*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'cafe-citoyen' ),
		)
	);

	/*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// Set up the WordPress core custom background feature.
	add_theme_support(
		'custom-background',
		apply_filters(
			'cafe_citoyen_custom_background_args',
			array(
				'default-color' => 'ffffff',
				'default-image' => '',
			)
		)
	);

	// Add theme support for selective refresh for widgets.
	add_theme_support( 'customize-selective-refresh-widgets' );

	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'cafe_citoyen_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function cafe_citoyen_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'cafe_citoyen_content_width', 640 );
}
add_action( 'after_setup_theme', 'cafe_citoyen_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function cafe_citoyen_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'cafe-citoyen' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'cafe-citoyen' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'cafe_citoyen_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function cafe_citoyen_scripts() {
	wp_enqueue_style( 'cafe-citoyen-style', get_stylesheet_uri(), array(), _S_VERSION );
	wp_style_add_data( 'cafe-citoyen-style', 'rtl', 'replace' );

	wp_enqueue_script( 'cafe-citoyen-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'cafe_citoyen_scripts' );

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
if ( defined( 'JETPACK__VERSION' ) ) {
	require get_template_directory() . '/inc/jetpack.php';
}


/**
 * Désactiver les éditeurs Gutenberg et Classique pour les articles et les pages
 * À ajouter dans functions.php de votre thème ou dans un plugin
 */

// Désactiver Gutenberg pour les articles (posts)
add_filter('use_block_editor_for_post', '__return_false', 10);

// Désactiver Gutenberg pour tous les types de contenu
add_filter('use_block_editor_for_post_type', '__return_false', 10);

// Désactiver le chargement des styles Gutenberg sur le front-end
function remove_gutenberg_styles() {
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-blocks-style');
}
add_action('wp_enqueue_scripts', 'remove_gutenberg_styles', 100);

// Supprimer l'éditeur classique des articles et des pages
function remove_classic_editor() {
    remove_post_type_support('post', 'editor');
    remove_post_type_support('page', 'editor');
}
add_action('init', 'remove_classic_editor');


/**
 * Créer un endpoint REST API pour une page d'options ACF
 * À ajouter dans functions.php ou dans un plugin
 */

// Enregistrer l'endpoint REST API
add_action('rest_api_init', function () {
    register_rest_route('acf/v1', '/options', array(
        'methods' => 'GET',
        'callback' => 'get_acf_options',
        'permission_callback' => '__return_true', // Accès public
    ));
    
    // Endpoint pour mettre à jour les options (nécessite authentification)
    register_rest_route('acf/v1', '/options', array(
        'methods' => 'POST',
        'callback' => 'update_acf_options',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        },
    ));
});

/**
 * Récupérer les options ACF
 */
function get_acf_options() {
    // Récupérer tous les champs d'une page d'options spécifique
    $options = array(
        'site_logo' => get_field('site_logo', 'option'),
        'contact_email' => get_field('contact_email', 'option'),
        'social_media' => get_field('social_media', 'option'),
        'footer_text' => get_field('footer_text', 'option'),
    );
    
    // Ou récupérer TOUS les champs de la page d'options
    // $options = get_fields('option');
    
    return rest_ensure_response($options);
}

/**
 * Mettre à jour les options ACF
 */
function update_acf_options($request) {
    $params = $request->get_json_params();
    
    if (empty($params)) {
        return new WP_Error(
            'no_data',
            'Aucune donnée fournie',
            array('status' => 400)
        );
    }
    
    $updated = array();
    
    foreach ($params as $field_name => $value) {
        // Mettre à jour chaque champ
        update_field($field_name, $value, 'option');
        $updated[$field_name] = $value;
    }
    
    return rest_ensure_response(array(
        'success' => true,
        'updated' => $updated,
        'message' => 'Options mises à jour avec succès'
    ));
}

/**
 * Exemple avec des groupes de champs spécifiques
 */
add_action('rest_api_init', function () {
    register_rest_route('acf/v1', '/options/(?P<group>[a-zA-Z0-9_-]+)', array(
        'methods' => 'GET',
        'callback' => 'get_acf_options_by_group',
        'permission_callback' => '__return_true',
        'args' => array(
            'group' => array(
                'required' => true,
                'validate_callback' => function($param) {
                    return is_string($param);
                }
            ),
        ),
    ));
});

/**
 * Récupérer les options par groupe
 */
function get_acf_options_by_group($request) {
    $group = $request['group'];
    
    // Définir les champs disponibles par groupe
    $groups = array(
        'general' => array('site_logo', 'site_title', 'tagline'),
        'contact' => array('contact_email', 'phone', 'address'),
        'social' => array('facebook_url', 'twitter_url', 'instagram_url'),
    );
    
    if (!isset($groups[$group])) {
        return new WP_Error(
            'invalid_group',
            'Groupe non trouvé',
            array('status' => 404)
        );
    }
    
    $options = array();
    foreach ($groups[$group] as $field) {
        $options[$field] = get_field($field, 'option');
    }
    
    return rest_ensure_response($options);
}

/**
 * Exemple d'utilisation avec AJAX depuis le frontend
 */
function enqueue_api_script() {
    wp_enqueue_script('acf-api-handler', get_template_directory_uri() . '/js/api-handler.js', array('jquery'), '1.0', true);
    
    wp_localize_script('acf-api-handler', 'acfApi', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
    ));
}
add_action('wp_enqueue_scripts', 'enqueue_api_script');


/**
 * Créer un endpoint API REST personnalisé pour les options ACF
 * À ajouter dans functions.php ou un plugin personnalisé
 */

add_action('rest_api_init', function () {
    register_rest_route('site/v1', '/reglages', array(
        'methods' => 'GET',
        'callback' => 'get_site_reglages',
        'permission_callback' => '__return_true', // Public - ajustez selon vos besoins
    ));
});

/**
 * Callback pour récupérer les réglages du site
 */
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



/**
 * Redirection du frontend
 */

add_action('template_redirect', function () {
    if (!is_admin() && !defined('REST_REQUEST')) {
        header('Location: https://wp-vitrine.com');
        exit;
    }
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/preview/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'get_post_preview',
        'permission_callback' => function () {
            return current_user_can('edit_posts');
        },
        'args' => [
            'id' => [
                'required' => true,
                'validate_callback' => function ($param) {
                    return is_numeric($param);
                }
            ],
            'token' => [
                'required' => true,
            ]
        ],
    ]);
});

