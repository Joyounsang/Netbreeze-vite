

$(document).ready(function () {
  AOS.init();
  setScreenSize();
  globalNavUi(); // 메인 헤더 이벤트
  btnUi(); // 버튼 이벤트
  dropDownUi(); // 드롭다운 이벤트
  innerTabUi(); // 페이지 내부 탭
  swiperTouchX();
  handleResponsiveLayout();
  switchImages();
  innerTabUi();
  headerScrollUi();
  $(window).resize(function () {
    handleResponsiveLayout();
    switchImages();
  });
  // modal Show Demo
  if ($('.modal').length) {
    modalSampleScript(); // 공통 팝업 띄우기
  }


});
$(window).on('scroll', function () {
  headerScrollUi();
  const banner = $('.app-section.banner');
  const fixedCta = $('.cover .btn');
  if (banner.length) {
    const bannerTop = banner.offset().top;
    const windowBottom = $(window).scrollTop() + $(window).height();

    // app-section.banner의 하단이 화면 하단에 닿았을 때
    if (bannerTop <= windowBottom) {
      fixedCta.addClass('on');
    } else {
      fixedCta.removeClass('on');
    }
  }
});

function headerScrollUi() {
  const scrollTop = $(window).scrollTop();

  if (scrollTop > 0) {
    $('.header').addClass('scroll');
  } else {
    $('header').removeClass('scroll');
  }
}

function switchImages() {
  $('.responsive').each(function () {
    const $this = $(this);
    const originalSrc = $this.attr('src');
    if (window.innerWidth <= 750) {
      if (!originalSrc.endsWith('-mo.png')) {
        const newSrc = originalSrc.replace('.png', '-mo.png');
        $this.attr('src', newSrc);
      }
    } else {
      const newSrc = originalSrc.replace('-mo.png', '.png');
      $this.attr('src', newSrc);
    }
  });
}

function handleResponsiveLayout() {
  $('.list-product .card').each(function () {
    const head = $(this).find('.head'); // 이동할 요소
    const imgColumn = $(this).find('.column.img'); // 이동 대상

    if ($(window).width() <= 750) {
      // 원래 위치를 저장
      if (!head.data('original-parent')) {
        head.data('original-parent', head.parent());
      }
      head.prependTo(imgColumn); // `.column.img`로 이동
    } else {
      // 원래 위치로 복원
      const originalParent = head.data('original-parent');
      if (originalParent) {
        head.prependTo(originalParent);
      }
    }
  });
}


function swiperTouchX() {
  const options = {
    autoHeight: false,
    slidesPerView: 'auto',
    pagination: false,
    freeMode: true,               // 자유 모드 활성화
    mousewheel: true,             // 마우스 휠로 스크롤 가능
    scrollbar: {
      el: '.swiper-scrollbar',  // 스크롤바 요소 추가
      draggable: true,          // 스크롤바 드래그 가능
    },
  };

  const swiperTouchX = new Swiper('.swiperTouchX', options);
}
function setScreenSize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}


function guideLnbUi() {
  // 초기에 모든 하위 ul을 감춥니다.
  $('.lnb.type-guide nav ul ul').hide();

  // 각 li 요소에 대해 more 클래스 추가 여부 결정
  $('.lnb.type-guide nav li').each(function () {
    const hasSubUl = $(this).find('> ul').length > 0;
    const hasA = $(this).find('> a').length > 0;

    if (hasSubUl && hasA) {
      $(this).addClass('more');
    }
  });

  // a 태그 클릭 시 이벤트 처리
  $('.lnb.type-guide nav a').click(function (e) {
    // 클릭된 a 태그의 다음에 위치한 ul 요소
    const subUl = $(this).next('ul');

    // 클릭된 a 태그의 다음에 위치한 ul이 존재하는 경우에만 이벤트 처리
    if (subUl.length > 0) {
      e.preventDefault();
      subUl.slideToggle();
      $(this).parent('li').toggleClass('on');
    }
  });
}



function globalNavUi() {
  // 모바일 환경 감지 함수
  function isMobile() {
    return window.innerWidth <= 719;
  }

  // .gnb 영역에 마우스를 올리면 모든 menu-container 표시 (데스크톱만)
  $('.gnb').on('mouseenter', function () {
    if (!isMobile()) {
      $(this).addClass('menu-open');
      $('.menu-container').addClass('on');
      $('.gnb-item.more').addClass('active');
    }
  });

  $('.gnb').on('mouseleave', function () {
    if (!isMobile()) {
      $(this).removeClass('menu-open');
      $('.menu-container').removeClass('on');
      $('.gnb-item.more').removeClass('active');
    }
  });

  // 개별 항목 클릭 시 토글 (gnb-link만)
  $('.gnb-item.more > .gnb-link').on('click', function (e) {
    // 모바일에서는 링크 기본 동작 방지하고 해당 항목만 토글
    if (isMobile()) {
      e.preventDefault();
      e.stopPropagation();
      const $gnbItem = $(this).parent('.gnb-item');
      const $menuContainer = $gnbItem.find('.menu-container');
      const isOpen = $menuContainer.hasClass('on');

      // 다른 메뉴는 모두 닫기
      $('.menu-container').not($menuContainer).removeClass('on');
      $('.gnb-item.more').not($gnbItem).removeClass('on');

      // 클릭한 항목만 토글
      $menuContainer.toggleClass('on');
      $gnbItem.toggleClass('on');
    } else {
      // 데스크톱에서는 기본 동작 유지 (마우스 이벤트로 처리)
      e.preventDefault();
    }
  });

  // 하위 메뉴 링크는 정상적으로 동작하도록 이벤트 전파 중단
  $('.menu-container a').on('click', function (e) {
    e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
    // 링크는 정상적으로 이동
  });

  // 모바일 메뉴 열기/닫기
  $('.mobileNav').on('click', function (e) {
    e.preventDefault();
    $(this).toggleClass('on');
    $('.header').toggleClass('open');
    $('html').toggleClass('overflow'); // 화면 스크롤 막음

    // 모바일 메뉴가 닫힐 때 모든 서브메뉴도 닫기
    if (!$(this).hasClass('on')) {
      $('.menu-container').removeClass('on');
      $('.gnb-item.more').removeClass('on');
    }
  })
}


function dropDownUi() {
  $('.type-dropdown').each(function () {
    const Button = $(this).find('.dropBtn');
    Button.on('click', function (e) {
      e.preventDefault();
      $(this).toggleClass('on');
      $(this).next('.dropCont').slideToggle();
    });
  });
}

function innerTabUi() {
  const tabTit = $('.radio-toggle, .inner-tab'),
    tabBtn = tabTit.find('li');

  const tabCnt = $('.tab-content'),
    tabIdx = tabCnt.index();

  // load style settings
  tabCnt.not(':eq(' + tabIdx + ')').hide();
  tabTit.each(function () {
    const defaultTit = $(this).children('li').eq(0);
    defaultTit.addClass('on');
  });
  $('.tab-component').each(function () {
    const defaultCnt = $(this).children('.tab-content').eq(0);
    defaultCnt.addClass('on').show();
  });

  tabBtn.on('click', function (e) {
    if ($(this).attr('rel')) {
      e.preventDefault();

      const $this = $(this),
        thisRel = $this.attr('rel');
      thisClass = $('.' + thisRel);
      thisText = $this.text();
      target = thisClass.parent('.tab-component').attr('id');

      // content connect
      $('#' + target + '>.tab-content')
        .hide()
        .removeClass('on');
      $('#' + target + ' .' + thisRel)
        .show()
        .addClass('on');

      // title styling and attr status
      $this.addClass('on').siblings().removeClass('on');
      thisClass.addClass('on').siblings().removeClass('on');
      $this
        .find('a')
        .attr('title', thisText + 'tab active')
        .parent()
        .siblings()
        .find('a')
        .attr('title', '');
    }
  });
}



function btnUi() {
  setTimeout(function () {
    $('.radio-toggle').each(function () {
      const $radioToggle = $(this);
      $radioToggle.find('ul').append('<span class="btn-in-ui"></span>');

      $radioToggle.find('li').on('click', function () {
        $radioToggle.find('li').removeClass('on'); // 해당 radio-toggle의 li 요소들에서 'on' 클래스 제거
        $(this).addClass('on'); // 현재 클릭된 li에 'on' 클래스 추가

        const thisBtnPosition = $(this).position().left;
        const thisInteractionUi = $radioToggle.find('.btn-in-ui');

        if ($(this).hasClass('on')) {
          thisInteractionUi.css('left', thisBtnPosition);
        }
      });
    });
  }, 10);


  // 모바일 푸터 
  $('.footerToggle').on('click', function (e) {
    e.preventDefault();
    $(this).toggleClass('on');
    $('.footer-body').slideToggle('fast');
  })

  // 모바일 플랜선택
  $('.planButton').on('click', function () {
    $('.planMenueGroup').addClass('open');
    $('.planMenueGroup a').on('click', function () {
      $(this).parents('.planMenueGroup').removeClass('open');
    });
  })

  // 모바일 이용가이드 and 약관 메뉴 
  $('.guide-main-title').on('click', function () {
    $('.lnb.type-guide').addClass('open');
    $('html').toggleClass('overflow'); // 화면 스크롤 막음
    createDim();
  })
  $('.lnb.type-guide .close').on('click', function () {
    $('.lnb.type-guide').removeClass('open');
    $('html').removeClass('overflow');
    removeDim();
  })



  const $buttonGroup = $(".button-group");
  const $buttons = $buttonGroup.find(".btn");

  // 버튼이 하나인 경우 single 클래스 추가
  if ($buttons.length === 1) {
    $buttonGroup.addClass("single");
  }

}
function modalUi() {
  $('.modal').each(function () {
    const layerHeight = $(this).outerHeight();
    $(this).css({
      marginTop: -layerHeight / 2
    });
  });
}
function modalSampleScript() {
  $('.modal').hide();
  $('.modalLoad').on('click', function (e) {
    e.preventDefault();
    const $target = $($(this).attr('href'));

    $target.show();
    setTimeout(function () {
      $target.find('.modal-dim').addClass('on');
      $target.addClass('on');

    }, 300);

    if ($('.setAni').length) {
      setTimeout(function () {
        $('.setAni').addClass('setAni-on');
      }, 1000);

    }

    modalUi();

    // close and focusout
    const isVisible = $target.is(':visible');
    const modalLength = $('.modal:visible').length;

    $target.find(".modalClose").on('click', function (e) {
      e.preventDefault();

      $target.find('.modal-dim').removeClass('on');
      $target.removeClass('on');
      setTimeout(function () {
        $target.hide();
      }, 300);

      $(this).off('click');
      if (isVisible) {
        if (modalLength > 1) {
          $target.fadeOut(250);
        } else {
          removeDim();
        }
      }
    });
  });
}

function defaultShowModal() {

  $('.defaultShow').each(function () {
    const $target = $(this);

    $target.show();
    setTimeout(function () {
      $target.find('.modal-dim').addClass('on');
      $target.addClass('on');
    }, 300);

    modalUi();

    // close and focusout
    const isVisible = $target.is(':visible');
    const modalLength = $('.modal:visible').length;

    $target.find(".modalClose").on('click', function (e) {
      e.preventDefault();

      $target.find('.modal-dim').removeClass('on');
      $target.removeClass('on');
      setTimeout(function () {
        $target.hide();
      }, 300);

      $(this).off('click');
      if (isVisible) {
        if (modalLength > 1) {
          $target.fadeOut(250);
        } else {
          removeDim();
        }
      }
    });
  });

}

function createDim() {
  if (!$('.dim').length) {
    $('body').append('<div class="dim"></div>');
  }
  $('.dim').fadeIn(250).addClass('on');
}

function removeDim() {
  $('.dim').removeClass('on').fadeOut(250);
}


document.addEventListener("DOMContentLoaded", function () {

  const performanceSection = document.querySelector(".performance");
  // .performance 요소가 존재하지 않으면 함수 종료
  if (!performanceSection) return;
  const infoComponents = performanceSection.querySelectorAll(".info-component");
  const deviceElement = performanceSection.querySelector(".device");
  let currentIndex = 1;
  let lastExecutionTime = 0; // 마지막 실행 시간
  const delay = 100; // 딜레이 간격 (ms)
  const triggerOffset = -500; // 조정 값 (양수: 늦게, 음수: 빨리 트리거)



  function updateDeviceClass() {
    const now = Date.now();
    if (now - lastExecutionTime < delay) return; // 딜레이 시간 내에는 실행하지 않음
    lastExecutionTime = now;

    const scrollY = window.scrollY - performanceSection.offsetTop; // .performance 기준 스크롤 위치
    const sectionHeight = performanceSection.offsetHeight;

    if (scrollY >= 0 && scrollY <= sectionHeight) {
      infoComponents.forEach((component, index) => {
        const offsetTop = component.offsetTop + triggerOffset; // 조정 값 적용
        const nextOffsetTop =
          index < infoComponents.length - 1
            ? infoComponents[index + 1].offsetTop + triggerOffset
            : sectionHeight;

        if (scrollY >= offsetTop && scrollY < nextOffsetTop) {
          const newIndex = index + 1;
          if (currentIndex !== newIndex) {
            // 클래스 변경
            deviceElement.classList.remove(`index${currentIndex}`);
            deviceElement.classList.add(`index${newIndex}`);
            currentIndex = newIndex;
          }
        }
      });
    }
  }

  // 초기 클래스 설정
  deviceElement.classList.add(`index${currentIndex}`);

  // 스크롤 이벤트 (쓰로틀 방식 적용)
  window.addEventListener("scroll", updateDeviceClass);
});