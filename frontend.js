jQuery(document).ready(function ($) {
    let isMobile = window.matchMedia('(max-width: 768px)').matches;
    var slideInterval;

    function clearSliderInterval() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    function initializeBehavior() {
        // Clear any existing interval first
        clearSliderInterval();

        if(isMobile){
            var totalSlides = $('.catalogue-thumbnail-container').length;
            var currentSlide = 0;
            
            // Clear existing pagination before creating new ones
            $('.bubble-pagination').empty();
            
            // Create pagination
            var paginationHtml = $('.bubble-pagination');
            for (var i = 0; i < totalSlides; i++) {
                paginationHtml.append('<button class="bubble" data-slide="' + i + '"></button>');
            }
    
            // Show first slide and activate first bubble
            $('.catalogue-thumbnail-container:first').addClass('active').show();
            $('.bubble:first').addClass('active');
    
            // Function to change slide
            function goToSlide(index) {
                $('.catalogue-thumbnail-container').removeClass('active').hide();
                $('.bubble').removeClass('active');
                
                currentSlide = index;
                $('.catalogue-thumbnail-container').eq(currentSlide).addClass('active').fadeIn();
                $('.bubble').eq(currentSlide).addClass('active');
            }
    
            // Auto slide function
            function startAutoSlide() {
                clearSliderInterval(); // Clear any existing interval
                slideInterval = setInterval(function() {
                    var nextSlide = (currentSlide + 1) % totalSlides;
                    goToSlide(nextSlide);
                }, 5000); //  5000 (5 seconds)
            }
    
            // Click handler for bubbles
            $('.bubble').click(function() {
                clearSliderInterval(); // Reset timer when manually changing slides
                var slideIndex = $(this).data('slide');
                goToSlide(slideIndex);
                startAutoSlide(); // Restart auto-slide
            });
    
            // Touch swipe functionality
            var startX, moveX;
            
            $('.catalogue-image').on('touchstart', function(e) {
                clearSliderInterval();
                startX = e.touches[0].clientX;
            });
    
            $('.catalogue-image').on('touchmove', function(e) {
                moveX = e.touches[0].clientX;
            });
    
            $('.catalogue-image').on('touchend', function() {
                if (startX && moveX) {
                    var diff = startX - moveX;
                    if (Math.abs(diff) > 50) {
                        var nextSlide;
                        if (diff > 0) {
                            nextSlide = (currentSlide + 1) % totalSlides;
                        } else {
                            nextSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                        }
                        goToSlide(nextSlide);
                    }
                }
                startX = null;
                moveX = null;
                startAutoSlide();
            });
    
            // Start auto-sliding
            startAutoSlide();
    
            // Reset interval when page becomes visible again
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    clearSliderInterval();
                } else {
                    startAutoSlide();
                }
            });
        } else {
            // Clear pagination when in desktop mode
            $('.bubble-pagination').empty();
            
            // Desktop behavior
            $('.catalogue-item').first().addClass('selected');
            
            function selectedItems(event) {
                const catalogueId = $(this).data('catalogue-id');

                // Hide all thumbnails and overlays
                $('.catalogue-thumbnail-container').hide();

                // add selected to only clicked items
                $(".catalogue-item").removeClass("selected");
                $(this).addClass("selected");
                // Show the selected catalogue's thumbnail and overlay
                $(`.catalogue-thumbnail-container[data-catalogue-id="${catalogueId}"]`).show();
            }
            
            $('.catalogue-item').on('click mouseenter', selectedItems);

            // Show the first catalogue by default
            $('.catalogue-thumbnail-container').hide().first().show();
        }
    }

    initializeBehavior();

    $(window).on('resize', function () {
        const newIsMobile = window.matchMedia('(max-width: 768px)').matches;

        if (newIsMobile !== isMobile) {
            isMobile = newIsMobile;
            initializeBehavior();
        }
    });
});