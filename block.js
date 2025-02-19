(function () {
    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useSelect = wp.data.useSelect;

    registerBlockType('our-catalogue/block', {
        title: 'catalogue Display',
        icon: 'slides',
        category: 'widgets',

        edit: function () {
            var catalogues = useSelect(function (select) {
                return select('core').getEntityRecords('postType', 'catalogue', {
                    per_page: -1,
                });
            }, []);

            if (!catalogues) {
                return el('p', {}, 'Loading catalogues...');
            }

            if (catalogues.length === 0) {
                return el('p', {}, 'No catalogues found. Please add some catalogues.');
            }

            var catalogueList = catalogues.map(function (catalogue) {
                return el(
                    'div',
                    { className: 'catalogue-display-item', key: catalogue.id },
                    el('strong', {}, catalogue.title.rendered),
                    el('img', {
                        src: catalogue.featured_media_url || '', // Use the added field
                        alt: catalogue.title.rendered,
                        style: { maxWidth: '100px', margin: '5px 0' },
                    })
                );
            });

            return el('div', { className: 'our-catalogue-editor-block' }, catalogueList);
        },

        save: function () {
            return null; // Rendered dynamically via PHP
        },
    });
})();
