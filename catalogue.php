<?php
/**
 * Plugin Name: Catalogue Display Panel 
 * Description: Allows the admin to upload catalogue images, associate them with pages, and display them in a responsive block.
 * Version: 1.0
 * Author: Rafiat Daniju
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Register Custom Post Type
function raf_catalogue_register_post_type() {
    register_post_type('catalogue', array(
        'labels' => array(
            'name' => __('catalogues'),
            'singular_name' => __('catalogue')
        ),
        'public' => true,
        'has_archive' => false,
        'show_in_rest' => true,
        'supports' => array('title', 'thumbnail'),
    ));
}
add_action('init', 'raf_catalogue_register_post_type');

// Add Meta Box for Associated Page
function raf_catalogue_add_meta_boxes() {
    add_meta_box(
        'catalogue_associated_page',
        __('Associated Page'),
        'raf_catalogue_render_meta_box',
        'catalogue',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'raf_catalogue_add_meta_boxes');

function raf_catalogue_render_meta_box($post) {
    $associated_page = get_post_meta($post->ID, '_associated_page', true);

    $pages = get_pages();
    echo '<label for="catalogue-associated-page">' . __('Select a Page:', 'our-catalogue') . '</label>';
    echo '<select name="catalogue-associated-page" id="catalogue-associated-page">';
    echo '<option value="">' . __('None', 'our-catalogue') . '</option>';
    foreach ($pages as $page) {
        echo '<option value="' . $page->ID . '" ' . selected($associated_page, $page->ID, false) . '>' . $page->post_title . '</option>';
    }
    echo '</select>';
}

// Save Meta Box Data
function raf_catalogue_save_meta_box_data($post_id) {
    if (array_key_exists('catalogue-associated-page', $_POST)) {
        update_post_meta($post_id, '_associated_page', sanitize_text_field($_POST['catalogue-associated-page']));
    }
}
add_action('save_post', 'raf_catalogue_save_meta_box_data');

add_filter('rest_prepare_catalogue', 'raf_catalogue_rest_featured_image', 10, 3);

function raf_catalogue_rest_featured_image($response, $post, $request) {
    // Only modify 'catalogue' post type REST response
    if ($post->post_type === 'catalogue') {
        $thumbnail_id = get_post_thumbnail_id($post->ID); // Get the thumbnail ID
        if ($thumbnail_id) {
            $thumbnail_url = wp_get_attachment_image_url($thumbnail_id, 'thumbnail'); // Get thumbnail URL
            $response->data['featured_media_url'] = $thumbnail_url;
        } else {
            $response->data['featured_media_url'] = ''; // Default to empty string
        }
    }

    return $response;
}
add_filter('rest_prepare_catalogue', 'raf_catalogue_rest_featured_image', 10, 3);

// Register Custom Block

function raf_catalogue_register_block() {
    // Register the block script
    wp_register_script(
        'our-catalogue-block',
        plugins_url('block.js', __FILE__),
        array('wp-blocks', 'wp-editor', 'wp-element', 'wp-i18n', 'wp-components'),
        filemtime(plugin_dir_path(__FILE__) . 'block.js')
    );

    // Register the block editor style
    wp_register_style(
        'our-catalogue-editor-style',
        plugins_url('editor.css', __FILE__),
        array('wp-edit-blocks'),
        filemtime(plugin_dir_path(__FILE__) . 'editor.css')
    );

    // Register the block front-end style
    wp_register_style(
        'our-catalogue-style',
        plugins_url('style.css', __FILE__),
        array(),
        filemtime(plugin_dir_path(__FILE__) . 'style.css')
    );

    // Register the block type
    register_block_type('our-catalogue/block', array(
        'editor_script' => 'our-catalogue-block',
        'editor_style'  => 'our-catalogue-editor-style',
        'style'         => 'our-catalogue-style',
        'render_callback' => 'raf_catalogue_render_block', // Dynamic rendering
    ));
}
add_action('init', 'raf_catalogue_register_block');

// Block Render Callback
function raf_catalogue_render_block($attributes) {
    $catalogues = get_posts(array(
        'post_type' => 'catalogue',
        'posts_per_page' => -1,
    ));

    if (!$catalogues) return '';

    ob_start();
    ?>
    <div class="our-catalogue">
        <div class="catalogue-list">
            <?php foreach ($catalogues as $catalogue): ?>
                <button class="catalogue-item" data-catalogue-id="<?php echo esc_attr($catalogue->ID); ?>">
                    <?php echo esc_html($catalogue->post_title); ?>
                </button>
            <?php endforeach; ?>
        </div>
        
        <div class="catalogue-image-container">
            <div class="catalogue-image">
                <?php foreach ($catalogues as $catalogue): ?>
                    <?php if (has_post_thumbnail($catalogue->ID)): ?>
                        <?php 
                        $associated_page_id = get_post_meta($catalogue->ID, '_associated_page', true);
                        $associated_page_url = $associated_page_id ? get_permalink($associated_page_id) : '#';
                        ?>
                        <div class="catalogue-thumbnail-container" data-catalogue-id="<?php echo esc_attr($catalogue->ID); ?>">
                            <div class="img-wrap">
                                <img class="catalogue-thumbnail" 
                                    src="<?php echo esc_url(get_the_post_thumbnail_url($catalogue->ID)); ?>" 
                                    alt="<?php echo esc_attr($catalogue->post_title); ?>" />
                            </div>
                            <div class="catalogue-overlay">
                                <h3 class="catalogue-title"><?php echo esc_html($catalogue->post_title); ?></h3>
                                <?php if($associated_page_url && strlen($associated_page_url) > 1){ ?>
                                    <a href="<?php echo esc_url($associated_page_url); ?>" class="catalogue-link-button">
                                        Learn More
                                    </a>
                                <?php } ?>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        
            <div class="bubble-pagination"></div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

// Enqueue Scripts for Frontend
function raf_catalogue_enqueue_scripts() {
    wp_enqueue_script('our-catalogue-frontend', plugins_url('frontend.js', __FILE__), array('jquery'), filemtime(plugin_dir_path(__FILE__) . 'frontend.js'), true);
}
add_action('wp_enqueue_scripts', 'raf_catalogue_enqueue_scripts');
