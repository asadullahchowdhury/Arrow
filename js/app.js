/*sticky header*/
window.addEventListener('scroll', function () {
    let header = document.getElementById('header')
    header.classList.toggle('sticky', scrollY > 350)
})


/*adding and removing active class for each section*/
let addClassOnScroll = function () {
    let windowTop = $(window).scrollTop();
    $('section[id]').each(function (index, elem) {
        let offsetTop = $(elem).offset().top;
        let outerHeight = $(this).outerHeight(true);

        if( windowTop > (offsetTop - 50) && windowTop < ( offsetTop + outerHeight)) {
            let elemId = $(elem).attr('id');
            $(".navbar-nav li a.active").removeClass('active');
            $(".navbar-nav li a[href='#" + elemId + "']").addClass('active');
        }
    });
};

$(function () {
    $(window).on('scroll', function () {
        addClassOnScroll();
    });
});



/*sliders*/
$(document).ready(function () {
    $(".owl-carousel").owlCarousel();
});

$('.slider-wrap').owlCarousel({
    loop: true,
    autoplay: true,
    animateOut: 'fadeOut',
    margin: 10,
    nav: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 1
        },
        1000: {
            items: 1
        }
    }
})

$('.service-nav-slider').owlCarousel({
    loop: true,
    // autoplay: true,
    margin: 0,
    nav: true,
    navText: [
        '<i class="fa-solid fa-chevron-left"></i>',
        '<i class="fa-solid fa-chevron-right"></i>'
    ],
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 3
        },
        1000: {
            items: 4
        }
    }
})

$('.testimonial-content-wrap').owlCarousel({
    loop: true,
    // autoplay: true,
    margin: 20,
    nav: true,
    navText: [
        '<i class="fa-solid fa-chevron-left"></i>',
        '<i class="fa-solid fa-chevron-right"></i>'
    ],
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 2
        },
        1000: {
            items: 3
        }
    }
})

$('.team-wrap').owlCarousel({
    loop: true,
    // autoplay: true,
    margin: 20,
    nav: true,
    navText: [
        '<i class="fa-solid fa-chevron-left"></i>',
        '<i class="fa-solid fa-chevron-right"></i>'
    ],
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 2
        },
        1000: {
            items: 4
        }
    }
})

$('.client-slider-wrap').owlCarousel({
    loop: true,
    // autoplay: true,
    margin: 20,
    nav: true,
    navText: [
        '<i class="fa-solid fa-chevron-left"></i>',
        '<i class="fa-solid fa-chevron-right"></i>'
    ],
    dots: false,
    responsive: {
        0: {
            items: 2
        },
        600: {
            items: 4
        },
        1000: {
            items: 6
        }
    }
})