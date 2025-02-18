(function () {
    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var useSelect = wp.data.useSelect;

    registerBlockType('our-fabric/block', {
        title: 'Fabric Display',
        icon: 'slides',
        category: 'widgets',

        edit: function () {
            var fabrics = useSelect(function (select) {
                return select('core').getEntityRecords('postType', 'fabric', {
                    per_page: -1,
                });
            }, []);

            if (!fabrics) {
                return el('p', {}, 'Loading fabrics...');
            }

            if (fabrics.length === 0) {
                return el('p', {}, 'No fabrics found. Please add some fabrics.');
            }

            var fabricList = fabrics.map(function (fabric) {
                return el(
                    'div',
                    { className: 'fabric-display-item', key: fabric.id },
                    el('strong', {}, fabric.title.rendered),
                    el('img', {
                        src: fabric.featured_media_url || '', // Use the added field
                        alt: fabric.title.rendered,
                        style: { maxWidth: '100px', margin: '5px 0' },
                    })
                );
            });

            return el('div', { className: 'our-fabric-editor-block' }, fabricList);
        },

        save: function () {
            return null; // Rendered dynamically via PHP
        },
    });
})();
