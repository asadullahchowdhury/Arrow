const root = document.documentElement
const header = document.getElementById('header')
const hero = document.getElementById('home')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v, min, max) => Math.min(Math.max(v, min), max)


/*page preloader: tracks image loading, keeps scroll locked until it is done*/
const Preloader = (function () {
    const loader = document.querySelector('.page-loader')
    const bar = loader.querySelector('.loader-bar span')
    const percentEl = loader.querySelector('.loader-percent')
    const minTime = 900
    const maxTime = 7000
    const started = performance.now()
    const callbacks = []
    let finished = false

    // the hero backgrounds are CSS images, so preload them too
    const sources = new Set()
    document.querySelectorAll('img[src]').forEach((img) => {
        if (img.loading !== 'lazy') sources.add(img.currentSrc || img.src)
    })
    document.querySelectorAll('.hero-bg').forEach((el) => {
        const match = el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)
        if (match) sources.add(new URL(match[1], document.baseURI).href)
    })

    const total = sources.size || 1
    let loaded = 0

    function setProgress(value) {
        const pct = Math.round(value * 100)
        bar.style.width = pct + '%'
        percentEl.textContent = pct + '%'
    }

    function tick() {
        loaded++
        setProgress(Math.min(loaded / total, .95))
        if (loaded >= total) done()
    }

    sources.forEach((src) => {
        const img = new Image()
        img.onload = img.onerror = tick
        img.src = src
    })

    function done() {
        if (finished) return
        finished = true
        setProgress(1)

        const wait = Math.max(minTime - (performance.now() - started), 0)
        setTimeout(() => {
            loader.classList.add('is-done')
            // start the hero animations while the curtain is lifting
            setTimeout(() => {
                root.classList.remove('is-loading')
                if (location.hash && document.querySelector(location.hash)) {
                    document.querySelector(location.hash).scrollIntoView({behavior: 'auto'})
                } else {
                    window.scrollTo(0, 0)
                }
                callbacks.forEach((fn) => fn())
            }, reduceMotion ? 0 : 350)
        }, wait + 200)
    }

    window.addEventListener('load', done)
    setTimeout(done, maxTime) // never trap the visitor behind the loader

    return {
        onDone(fn) {
            finished && !root.classList.contains('is-loading') ? fn() : callbacks.push(fn)
        }
    }
})()


/*header: solid when scrolled, hides on scroll down, shows on scroll up*/
let lastY = window.scrollY
let scrollTicking = false

function setActiveNav() {
    const windowTop = window.scrollY
    let current = null

    // highlight the last menu target we have scrolled past, so the
    // unlabelled sections in between keep their parent's highlight
    $('.navbar-nav li a[href^="#"]').each(function () {
        const target = $($(this).attr('href'))
        if (target.length && windowTop >= target.offset().top - 120) current = this
    })

    if (!current) current = $('.navbar-nav li a[href="#home"]')[0]
    const $current = $(current)
    if ($current.hasClass('active')) return

    $('.navbar-nav li a.active').removeClass('active').removeAttr('aria-current')
    $current.addClass('active').attr('aria-current', 'true')
}

function updateHeader(y) {
    const menuOpen = header.classList.contains('menu-open')
    header.classList.toggle('is-scrolled', y > 40)

    if (!menuOpen) {
        const goingDown = y > lastY + 4
        const goingUp = y < lastY - 4
        if (goingDown && y > 500) header.classList.add('is-hidden')
        if (goingUp || y < 500) header.classList.remove('is-hidden')
    }

    const max = document.documentElement.scrollHeight - window.innerHeight
    header.style.setProperty('--scroll-progress', max > 0 ? (y / max).toFixed(4) : 0)
}

// scroll-driven dolly on the hero: image pushes in and drifts, text lifts away
function updateHeroDolly(y) {
    if (reduceMotion) return
    const h = hero.offsetHeight
    if (y > h) return
    const p = clamp(y / h, 0, 1)
    hero.style.setProperty('--hero-scale', (1 + p * 0.15).toFixed(4))
    hero.style.setProperty('--hero-shift', (p * h * 0.35).toFixed(1) + 'px')
    hero.style.setProperty('--content-shift', (-p * 140).toFixed(1) + 'px')
    hero.style.setProperty('--content-opacity', clamp(1 - p * 1.6, 0, 1).toFixed(3))
}

function onScroll() {
    const y = window.scrollY
    updateHeader(y)
    updateHeroDolly(y)
    setActiveNav()
    lastY = y
    scrollTicking = false
}

window.addEventListener('scroll', function () {
    if (!scrollTicking) {
        window.requestAnimationFrame(onScroll)
        scrollTicking = true
    }
}, {passive: true})

$(function () {
    onScroll()

    const menu = document.getElementById('navbarHome')
    menu.addEventListener('show.bs.collapse', () => header.classList.add('menu-open'))
    menu.addEventListener('hidden.bs.collapse', () => header.classList.remove('menu-open'))

    // close the mobile menu after a link is tapped
    $('#navbarHome a').on('click', function () {
        if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide()
    })
})


/*reveal on scroll*/
const revealGroups = [
    ['.about-top-text', 'up'],
    ['.about-item', 'up', true],
    ['.intro-img', 'left'],
    ['.intro-content', 'right'],
    ['.each-service', 'up', true],
    ['.each-num-wrap', 'up', true],
    ['.portfolio-head', 'up'],
    ['.work-item', 'up', true],
    ['#services .sec-title, .service-nav, #services .service-tab-content', 'up', true],
    ['.pricing-section .sec-title', 'up'],
    ['.price-box', 'up', true],
    ['.testimonial-section .sec-title, .testimonial-content-wrap', 'up', true],
    ['.ready-section .col-lg-10', 'zoom'],
    ['.our-team .sec-title, .team-wrap', 'up', true],
    ['.latest-news-section .sec-title', 'up'],
    ['.each-news', 'up', true],
    ['.contact-us-section .sec-title, .contact-form', 'up', true],
    ['.client-slider-wrap', 'fade'],
    ['.contact-section .info > *', 'left', true]
]

if (!reduceMotion && 'IntersectionObserver' in window) {
    // sideways slides would push past the screen edge on phones, so use upward reveals there
    const narrow = window.matchMedia('(max-width: 991px)').matches

    revealGroups.forEach(([selector, type, stagger]) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.setAttribute('data-reveal', narrow && (type === 'left' || type === 'right') ? 'up' : type)
            if (stagger) el.style.setProperty('--reveal-delay', ((i % 4) * 0.12).toFixed(2) + 's')
        })
    })

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const el = entry.target
            el.classList.add('is-revealed')
            observer.unobserve(el)

            // hand transforms back to the element's own hover effects afterwards
            const delay = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0
            setTimeout(() => {
                el.removeAttribute('data-reveal')
                el.classList.remove('is-revealed')
                el.style.removeProperty('--reveal-delay')
            }, 1000 + delay * 1000)
        })
    }, {threshold: 0.15, rootMargin: '0px 0px -8% 0px'})

    // wait for the loader so the first sections animate in view, not behind it
    Preloader.onDone(() => {
        document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el))
    })
}


/*counters: count up once when they scroll into view*/
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
    Preloader.onDone(() => nums.forEach((num) => counterObserver.observe(num)))
} else {
    nums.forEach(countUp)
}


/*portfolio filter*/
const grid = document.querySelector('.portfolio-grid')
const workItems = Array.from(document.querySelectorAll('.portfolio-grid .work-item'))
let filterRun = 0

$('.filter-btn').on('click', function () {
    const filter = this.dataset.filter
    if (this.classList.contains('is-active')) return

    $('.filter-btn').removeClass('is-active').attr('aria-pressed', 'false')
    $(this).addClass('is-active').attr('aria-pressed', 'true')

    const run = ++filterRun
    const matches = (item) => filter === 'all' || item.dataset.category === filter
    const visible = workItems.filter((item) => !item.classList.contains('is-hidden'))

    // 1. fade the current set out
    visible.forEach((item) => item.classList.add('is-leaving'))

    setTimeout(() => {
        if (run !== filterRun) return

        // 2. swap the set and the layout
        grid.classList.toggle('is-filtered', filter !== 'all')
        const shown = []
        workItems.forEach((item) => {
            item.classList.remove('is-leaving')
            const show = matches(item) || (filter === 'all' && item.classList.contains('work-cta'))
            item.classList.toggle('is-hidden', !show)
            if (show) {
                item.classList.add('is-entering')
                shown.push(item)
            }
        })
        document.querySelector('.portfolio-empty').hidden = shown.length > 0

        // 3. bring the new set in, one after another
        void grid.offsetWidth
        shown.forEach((item, i) => {
            item.style.transitionDelay = (i * 0.07).toFixed(2) + 's'
            item.classList.remove('is-entering')
            setTimeout(() => (item.style.transitionDelay = ''), 600 + i * 70)
        })
    }, reduceMotion ? 0 : 320)
})


/*portfolio lightbox with previous / next*/
const lightboxEl = document.getElementById('lightbox')
const lightboxImg = lightboxEl.querySelector('.lightbox-img')
let gallery = []
let galleryIndex = 0

function showWork(index) {
    galleryIndex = (index + gallery.length) % gallery.length
    const link = gallery[galleryIndex]
    const title = link.dataset.lightbox

    lightboxImg.classList.add('is-switching')
    const next = new Image()
    next.onload = next.onerror = () => {
        lightboxImg.src = link.getAttribute('href')
        lightboxImg.alt = title
        requestAnimationFrame(() => lightboxImg.classList.remove('is-switching'))
    }
    next.src = link.getAttribute('href')

    $('#lightbox-caption').text(title)
    $(lightboxEl).find('.lightbox-cat').text(link.dataset.categoryLabel || '')
    $(lightboxEl).find('.lightbox-desc').text(link.dataset.desc || '')
    $(lightboxEl).find('.lightbox-count').text((galleryIndex + 1) + ' / ' + gallery.length)
    $(lightboxEl).find('.lightbox-nav').toggle(gallery.length > 1)
}

$(document).on('click', '[data-lightbox]', function (e) {
    e.preventDefault()
    gallery = Array.from(document.querySelectorAll('.portfolio-grid .work-item:not(.is-hidden) [data-lightbox]'))
    showWork(Math.max(gallery.indexOf(this), 0))
    bootstrap.Modal.getOrCreateInstance(lightboxEl).show()
})

$(lightboxEl).on('click', '.lightbox-nav.prev', () => showWork(galleryIndex - 1))
$(lightboxEl).on('click', '.lightbox-nav.next', () => showWork(galleryIndex + 1))
document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('show')) return
    if (e.key === 'ArrowLeft') showWork(galleryIndex - 1)
    if (e.key === 'ArrowRight') showWork(galleryIndex + 1)
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


/*hero slider: crossfade + dolly, custom counter, progress bar and arrows*/
const SLIDE_DURATION = 7000
const $hero = $('.slider-wrap')
const heroProgress = document.querySelector('.hero-progress')
const heroCurrent = document.querySelector('.hero-counter .current')
hero.style.setProperty('--slide-duration', SLIDE_DURATION + 'ms')

function restartHeroProgress() {
    if (reduceMotion) return
    heroProgress.classList.remove('is-running')
    void heroProgress.offsetWidth
    heroProgress.classList.add('is-running')
}

$hero.on('initialized.owl.carousel changed.owl.carousel', function (e) {
    if (!e.item || !e.relatedTarget) return
    const index = e.relatedTarget.relative(e.item.index)
    heroCurrent.textContent = String(index + 1).padStart(2, '0')
    if (e.type === 'changed' && !root.classList.contains('is-loading')) restartHeroProgress()
})

$hero.owlCarousel({
    loop: true,
    autoplay: false,
    autoplayTimeout: SLIDE_DURATION,
    autoplayHoverPause: false,
    animateOut: 'fadeOut',
    smartSpeed: 900,
    margin: 0,
    nav: false,
    dots: false,
    items: 1
})

document.querySelector('.hero-counter .total').textContent =
    String(document.querySelectorAll('.slider-wrap .owl-item:not(.cloned)').length).padStart(2, '0')

// start the timer only once the loader is gone; restart it after manual navigation
function playHero() {
    if (reduceMotion) return
    $hero.trigger('stop.owl.autoplay').trigger('play.owl.autoplay', [SLIDE_DURATION])
    restartHeroProgress()
}

Preloader.onDone(playHero)
$('.hero-prev').on('click', () => {
    $hero.trigger('prev.owl.carousel')
    playHero()
})
$('.hero-next').on('click', () => {
    $hero.trigger('next.owl.carousel')
    playHero()
})
$hero.on('dragged.owl.carousel', playHero)


/*other sliders*/
const prevNext = [
    '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i><span class="visually-hidden">Previous</span>',
    '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span class="visually-hidden">Next</span>'
]

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

// re-measure once everything (fonts, images, scrollbar) has settled
window.addEventListener('load', function () {
    $('.owl-carousel').trigger('refresh.owl.carousel')
})
