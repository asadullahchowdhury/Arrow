/*sticky header*/
window.addEventListener('scroll', function () {
    let header = document.getElementById('header')
    header.classList.toggle('sticky', scrollY > 350)
})


/*adding and removing active class for each section*/
let addClassOnScroll = function () {
    let windowTop = $(window).scrollTop();
   if (windowTop < 447){
       console.log('wintop home')
       $('.homeId').addClass('active')
       $('.aboutId').removeClass('active')
   }else {
       $('.homeId').removeClass('active')

   }
    $('section[id]').each(function (index, elem) {
        let offsetTop = $(elem).offset().top;
        let outerHeight = $(this).outerHeight(true);

        if( windowTop > (offsetTop - 50) && windowTop < ( offsetTop + outerHeight)) {
            console.log(offsetTop,'off')
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

/*page preloader*/
function PreLoader(){
    let loader = document.querySelector('.page-loader')

    setTimeout(()=>{
        loader.classList.add('d-none')
    },1000)
}
PreLoader()



/*counters*/
window.addEventListener('load', function () {
    const nums = document.querySelectorAll('.num')
    nums.forEach((num) => {
        if (num.classList.contains('num-1')) {
            countUP('.num-1', 368)
        } else if (num.classList.contains('num-2')) {
            countUP('.num-2', 937)
        } else if (num.classList.contains('num-3')) {
            countUP('.num-3', 442)
        } else if (num.classList.contains('num-4')) {
            countUP('.num-4', 1946)
        }
        console.log(num)
    })

})

function countUP(c, number) {
    const count1 = document.querySelector(c)
    const count1val = parseInt(document.querySelector('.num-1').innerText)
    let count = count1val
    console.log(count1val, 'hello')
    let timeout = null
    timeout = setInterval(() => {
        if (count >= number) {
            clearInterval(timeout)
        }
        count1.innerText = count++

    }, .1)


}


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
    margin: 10,
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
    nav: false,
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
