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
            var totalSlides = $('.fabric-thumbnail-container').length;
            var currentSlide = 0;
            
            // Clear existing pagination before creating new ones
            $('.bubble-pagination').empty();
            
            // Create pagination
            var paginationHtml = $('.bubble-pagination');
            for (var i = 0; i < totalSlides; i++) {
                paginationHtml.append('<button class="bubble" data-slide="' + i + '"></button>');
            }
    
            // Show first slide and activate first bubble
            $('.fabric-thumbnail-container:first').addClass('active').show();
            $('.bubble:first').addClass('active');
    
            // Function to change slide
            function goToSlide(index) {
                $('.fabric-thumbnail-container').removeClass('active').hide();
                $('.bubble').removeClass('active');
                
                currentSlide = index;
                $('.fabric-thumbnail-container').eq(currentSlide).addClass('active').fadeIn();
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
            
            $('.fabric-image').on('touchstart', function(e) {
                clearSliderInterval();
                startX = e.touches[0].clientX;
            });
    
            $('.fabric-image').on('touchmove', function(e) {
                moveX = e.touches[0].clientX;
            });
    
            $('.fabric-image').on('touchend', function() {
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
            $('.fabric-item').first().addClass('selected');
            
            function selectedItems(event) {
                const fabricId = $(this).data('fabric-id');

                // Hide all thumbnails and overlays
                $('.fabric-thumbnail-container').hide();

                // add selected to only clicked items
                $(".fabric-item").removeClass("selected");
                $(this).addClass("selected");
                // Show the selected fabric's thumbnail and overlay
                $(`.fabric-thumbnail-container[data-fabric-id="${fabricId}"]`).show();
            }
            
            $('.fabric-item').on('click mouseenter', selectedItems);

            // Show the first fabric by default
            $('.fabric-thumbnail-container').hide().first().show();
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