/*sticky header + active nav link on scroll*/
let header = document.getElementById('header')
let scrollTicking = false

let addClassOnScroll = function () {
    let windowTop = $(window).scrollTop();
    let current = null;

    // highlight the last menu target we have scrolled past, so the
    // unlabelled sections in between keep their parent's highlight
    $('.navbar-nav li a[href^="#"]').each(function () {
        let target = $($(this).attr('href'));
        if (target.length && windowTop >= target.offset().top - 50) {
            current = this;
        }
    });

    if (!current) current = $('.navbar-nav li a[href="#home"]')[0];

    $(".navbar-nav li a.active").removeClass('active').removeAttr('aria-current');
    $(current).addClass('active').attr('aria-current', 'true');
};

function onScroll() {
    header.classList.toggle('sticky', window.scrollY > 350)
    addClassOnScroll()
    scrollTicking = false
}

window.addEventListener('scroll', function () {
    if (!scrollTicking) {
        window.requestAnimationFrame(onScroll)
        scrollTicking = true
    }
}, {passive: true})

$(function () {
    onScroll();

    // close the mobile menu after a link is tapped
    $('.navbar-nav .nav-link').on('click', function () {
        let menu = document.getElementById('navbarHome');
        if (menu.classList.contains('show')) {
            bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
    });
});


/*page preloader*/
function PreLoader() {
    let loader = document.querySelector('.page-loader')

    setTimeout(() => {
        loader.classList.add('d-none')
    }, 1000)
}

PreLoader()


/*counters: count up once when they scroll into view*/
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function countUp(el) {
    const target = parseInt(el.dataset.target, 10) || 0
    const duration = 2000
    const start = performance.now()

    if (reduceMotion) {
        el.textContent = target.toLocaleString()
        return
    }

    function step(now) {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        el.textContent = Math.round(target * eased).toLocaleString()
        if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
}

const nums = document.querySelectorAll('.num[data-target]')
if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                countUp(entry.target)
                observer.unobserve(entry.target)
            }
        })
    }, {threshold: 0.5})
    nums.forEach((num) => counterObserver.observe(num))
} else {
    nums.forEach(countUp)
}


/*portfolio lightbox*/
$(document).on('click', '[data-lightbox]', function (e) {
    e.preventDefault()
    const modalEl = document.getElementById('lightbox')
    const caption = $(this).data('lightbox')
    $(modalEl).find('.modal-body img').attr({src: $(this).attr('href'), alt: caption})
    $(modalEl).find('#lightbox-caption').text(caption)
    bootstrap.Modal.getOrCreateInstance(modalEl).show()
})


/*blog articles open in a modal*/
$(document).on('click', '[data-article]', function (e) {
    e.preventDefault()
    const post = $(this).closest('.each-news')
    const modalEl = document.getElementById('article-modal')
    const modal = $(modalEl)
    const img = post.find('.posted-img img')

    modal.find('.article-img').attr({src: img.attr('src'), alt: img.attr('alt')})
    modal.find('.article-date').text(post.find('.date a').text().replace(/\s+/g, ' ').trim())
    modal.find('#article-title').text(post.find('.news-title a').text().trim())
    modal.find('.article-text').html(post.find('.article-body').html())
    bootstrap.Modal.getOrCreateInstance(modalEl).show()
})


/*pricing buttons pre-fill the contact form*/
$('[data-plan]').on('click', function () {
    $('#contact-subject').val($(this).data('plan') + ' plan enquiry')
    setTimeout(() => document.getElementById('contact-name').focus({preventScroll: true}), 600)
})


/*contact form: validate, then send to Formspree when configured*/
$('.contact-form').on('submit', async function (e) {
    e.preventDefault()
    const form = this
    const status = $(form).find('.form-status')
    const button = $(form).find('button[type="submit"]')

    status.removeClass('success error').text('')

    $(form).find('[required]').each(function () {
        $(this).toggleClass('is-invalid', !this.checkValidity())
    })
    if (!form.checkValidity()) {
        $(form).find('.is-invalid').first().trigger('focus')
        return
    }

    const name = $('#contact-name').val().trim()

    // the form action still has the placeholder: behave like a demo instead of failing
    if (form.action.includes('YOUR_FORM_ID')) {
        status.addClass('success').text('Thanks, ' + name + '! This is a demo, so your message was not actually sent.')
        form.reset()
        return
    }

    button.prop('disabled', true)
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {Accept: 'application/json'}
        })
        if (!response.ok) throw new Error('Request failed')
        status.addClass('success').text('Thanks, ' + name + '! Your message has been sent. We will reply soon.')
        form.reset()
    } catch (err) {
        status.addClass('error').text('Sorry, something went wrong. Please try again in a moment.')
    } finally {
        button.prop('disabled', false)
    }
})

$('.contact-form [required]').on('input', function () {
    if (this.checkValidity()) $(this).removeClass('is-invalid')
})


/*footer year*/
document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear()
})


/*sliders*/
const prevNext = [
    '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i><span class="visually-hidden">Previous</span>',
    '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span class="visually-hidden">Next</span>'
]

$('.slider-wrap').owlCarousel({
    loop: true,
    autoplay: !reduceMotion,
    autoplayTimeout: 6000,
    autoplayHoverPause: true,
    animateOut: 'fadeOut',
    margin: 0,
    nav: false,
    items: 1
})

// re-measure once everything (fonts, images, scrollbar) has settled
window.addEventListener('load', function () {
    $('.owl-carousel').trigger('refresh.owl.carousel')
})

$('.service-nav-slider').owlCarousel({
    loop: false,
    margin: 10,
    nav: true,
    navText: prevNext,
    dots: false,
    responsive: {
        0: {items: 1},
        600: {items: 2},
        1000: {items: 4}
    }
})

$('.testimonial-content-wrap').owlCarousel({
    loop: true,
    autoplay: !reduceMotion,
    autoplayTimeout: 7000,
    autoplayHoverPause: true,
    margin: 20,
    nav: true,
    navText: prevNext,
    dots: false,
    responsive: {
        0: {items: 1},
        600: {items: 2},
        1000: {items: 3}
    }
})

$('.team-wrap').owlCarousel({
    loop: false,
    margin: 20,
    nav: false,
    dots: true,
    responsive: {
        0: {items: 1},
        600: {items: 2},
        1000: {items: 4}
    }
})

$('.client-slider-wrap').owlCarousel({
    loop: true,
    autoplay: !reduceMotion,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    margin: 20,
    nav: false,
    dots: false,
    responsive: {
        0: {items: 2},
        600: {items: 4},
        1000: {items: 6}
    }
})
