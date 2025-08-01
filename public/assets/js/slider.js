(function ($) {
    "use strict";
    $(document).ready(function () {
        function sliderAnimations(elements) {
            var animationEndEvents = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            elements.each(function () {
                var $this = $(this);
                var $animationDelay = $this.data("delay");
                var $animationDuration = $this.data("duration");
                var $animationType = "edcare-animation " + $this.data("animation");
                $this.css({
                    "animation-delay": $animationDelay,
                    "-webkit-animation-delay": $animationDelay,
                    "animation-duration": $animationDuration,
                });
                $this.addClass($animationType).one(animationEndEvents, function () {
                    $this.removeClass($animationType);
                });
            });
        }

        if ($(".edcare-slider-thumb").hasClass("is-hr-view")) {
            var sliderDir = 'horizontal';
        } else {
            var sliderDir = 'vertical';
        }

        var swiperThumb = new Swiper(".edcare-slider-thumb", {
            spaceBetween: 10,
            slidesPerView: 3,
            freeMode: true,
            watchSlidesProgress: true,
            clickable: true,
            direction: sliderDir,
        });

        var sliderOptions = {
            speed: 1500,
            autoplay: {
                delay: 7000,
            },
            disableOnInteraction: false,
            initialSlide: 0,
            parallax: false,
            mousewheel: false,
            loop: true,
            grabCursor: true,
            effect: "fade",
            navigation: {
                nextEl: ".slider-arrow .slider-next",
                prevEl: ".slider-arrow .slider-prev",
            },
            pagination: {
                el: ".edcare-swiper-pagination",
                clickable: true,
            },
            thumbs: {
                swiper: swiperThumb,
            },
            on: {
                slideChangeTransitionStart: function () {
                    var swiper = this;
                    var animatingElements = $(swiper.slides[swiper.activeIndex]).find("[data-animation]");
                    sliderAnimations(animatingElements);
                },
                resize: function () {
                    this.update();
                },
            },
        };

        var swiper = new Swiper(".edcare-slider", sliderOptions);
    });
})(jQuery);
