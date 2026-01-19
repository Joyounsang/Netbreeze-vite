'use strict';
$(document).ready(function () {
  setScreenSize();
  $('.scrollbar').scrollbar(); // 스크롤디자인 라이브러리호출
  btnEvent();
  layoutSystem();
  updateFilePath();
  gnbMenuToggle();
  tooltipInit();
  treeMenuInit();

  clickModal();
  innerTabUi();
  progressUi();
  setTimeout(function () {
    commonSlide();
    serviceSlide();
    defaultModal();
    datepicker();
  }, 10);
});
$(window).on('resize', function () {
  modalSize();
  checkGlobalNavState();
});
function progressUi() {
  $('.bar').each(function () {
    const maxValue = parseFloat($(this).data('max-value'));
    const currentValue = parseFloat($(this).data('value'));

    // 비율 계산
    const percentage = (currentValue / maxValue) * 100;
    $(this).css('width', percentage + '%');
  });
}
function updateFilePath() {
  $('.file-input-group').each(function () {
    const fileInput = $(this).find('input[type="file"]');
    fileInput.on('change', function () {
      var filePathInput = $(this).closest('.file-input-group').find('.file-path');
      filePathInput.val($(this).val().split('\\').pop());
    });
  })

}
function btnEvent() {


  $('.accountIcon').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).closest('.account').toggleClass('active');
  });

  $('.button-tab-item').on('click', function (e) {
    e.preventDefault();
    $(this).addClass('on').siblings('.button-tab-item').removeClass('on');
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.account').length) {
      $('.account').removeClass('active');
    }
  });

  $('.account').on('click', function (e) {
    e.stopPropagation();
  });
}
function datepicker() {
  if ($('.timepicker').length) {
    $('.timepicker').datetimepicker({
      dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
      monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      dayNames: ['일', '월', '화', '수', '목', '금', '토'], // 요일 텍스트 설정
      dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'], // 요일 텍스트 축약 설정&nbsp;
      firstDay: 1,//  0: 일요일 부터 시작, 1:월요일 부터 시작
      timeFormat: 'HH:mm',
      controlType: 'select',
      oneLine: true,
      closeText: '완료',
      timeOnlyTitle: '시간 선택',
      timeText: '시간',
      hourText: '시',
      minuteText: '분',
      secondText: '초',
      timezoneText: '시간대'
    });
  }

  if ($('.datepicker').length) {
    // 오늘 날짜 가져오기
    const today = new Date();
    const todayString = $.datepicker.formatDate('yy-mm-dd', today);

    // DATEPICKER
    $('.datepicker').datepicker({
      dateFormat: 'yy-mm-dd',
      changeMonth: false,
      changeYear: false,
      altFormat: "yy-mm-dd(DD)",
      dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
      monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      dayNames: ['일', '월', '화', '수', '목', '금', '토'], // 요일 텍스트 설정
      dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'], // 요일 텍스트 축약 설정&nbsp;
      firstDay: 0,//  0: 일요일 부터 시작, 1:월요일 부터 시작 (일요일을 맨 좌측에)
      defaultDate: today, // 기본 날짜를 오늘로 설정
      onSelect: function (dateText, inst) {
        // datepicker 값이 변경되면 부모 .input-date에 on 클래스 추가
        $(this).closest('.input-date').addClass('on');
      }
    }).datepicker('setDate', today); // 초기값을 오늘 날짜로 설정

    // input 값이 직접 변경될 때도 처리 (수동 입력 등)
    $('.datepicker').on('change', function () {
      if ($(this).val()) {
        $(this).closest('.input-date').addClass('on');
      } else {
        $(this).closest('.input-date').removeClass('on');
      }
    });

    const disabledDates = ["2024-07-04", "2024-07-10", "2024-07-15"]; // 비활성화할 날짜 목록

    function disableSpecificDates(date) {
      var string = jQuery.datepicker.formatDate('yy-mm-dd', date);
      var isDisabled = disabledDates.indexOf(string) !== -1;
      return [!isDisabled, "", isDisabled ? "disabled" : ""];
    }

    $("#datepicker1").datepicker("option", "beforeShowDay", disableSpecificDates);
  }
}

function innerTabUi() {
  const tabTit = $('.inner-tab'),
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

      setTimeout(function () {
        modalSize();
      }, 4);

      const $this = $(this)
      const thisRel = $this.attr('rel');
      const thisClass = $(`.${thisRel}`);
      const thisText = $this.text();
      const target = thisClass.parent('.tab-component').attr('id');

      // content connect

      $(`#${target}>.tab-content`)
        .hide()
        .removeClass('on');
      $(`#${target}>.${thisRel}`)
        .show()
        .addClass('on');

      // title styling and attr status
      $this.addClass('on').siblings().removeClass('on');
      thisClass.addClass('on').siblings().removeClass('on');
      $this
        .find('a')
        .attr(`title${thisText}tab active`)
        .parent()
        .siblings()
        .find('a')
        .attr('title', '');
    }
  });
}





function setScreenSize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 화면 크기에 따라 globalNav 상태 설정
function checkGlobalNavState() {
  const width = window.innerWidth;
  const $globalNav = $('.globalNav');
  const $viewport = $('.viewport');

  if (width <= 1439) {
    // 1439px 이하: globalNav active 상태가 기본
    $globalNav.addClass('active');
    $viewport.addClass('gnb-hidden');
  } else {
    // 1440px 이상: globalNav active 상태 해제
    $globalNav.removeClass('active');
    $viewport.removeClass('gnb-hidden');
  }

  // 차트 재로드 및 레이아웃 재정렬
  setTimeout(function () {
    if (window.chatChartInstance) {
      window.chatChartInstance.resize();
    }
    if (window.gaugeChartInstance) {
      window.gaugeChartInstance.resize();
    }
  }, 300);
}

function layoutSystem() {
  // 초기 화면 크기 체크
  checkGlobalNavState();

  // globalNav 클릭 시 GNB 숨기기/보이기
  $('.globalNav').on('click', function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
    $('.viewport').toggleClass('gnb-hidden');
  })
  const countNum = $('.row'),
    classNum = countNum.length;
  for (let i = 0; i < classNum; i++) {
    const classCount = 'col-' + countNum.eq(i).find('>li, >.column').length;
    countNum.eq(i).addClass(classCount);
  }
}

function modalSize() {
  $('.modal').each(function () {
    const layerHeight = $(this).outerHeight();
    $(this).css({
      marginTop: -layerHeight / 2
    });
  });
}

function clickModal() {
  $('.modalLoad').on('click', function (e) {
    e.preventDefault();
    const $target = $($(this).attr('href'));
    // show
    $target.removeClass('hide-animation');
    $('html').addClass('overflow');
    $target.addClass('on');

    // option
    modalSize();

    $target.find(".modalClose").on('click', function (e) {
      e.preventDefault();
      $target.addClass('hide-animation');
      // hide
      setTimeout(function () {
        $('html').removeClass('overflow');
        $target.removeClass('on');
      }, 400);
      $(this).off('click');
    });

    $(".modalCloseAll").on('click', function (e) {
      e.preventDefault();
      $('.modal').addClass('hide-animation');
      // hide
      setTimeout(function () {
        $('html').removeClass('overflow');
        $('.modal').removeClass('on');
      }, 400);
      $(this).off('click');
    });
  });
}

function defaultModal() {
  modalSize();
  $('.modal').each(function () {
    const $target = $(this);
    $target.find(".modalClose").on('click', function (e) {
      e.preventDefault();
      $target.addClass('hide-animation');
      setTimeout(function () {
        $('html').removeClass('overflow');
        $target.removeClass('on');
      }, 400);
    });
  })
}

function gnbMenuToggle() {
  $('.menu-item > a.arrow').on('click', function (e) {
    e.preventDefault();
    const $menuItem = $(this).closest('.menu-item');

    // 클릭한 메뉴 아이템만 toggle (여러 개 동시에 열 수 있음)
    $menuItem.toggleClass('active');
  });
}

function commonSlide() {
  const swiperCommon = new Swiper('.noticeSwiper', {
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination .inner',
      type: 'fraction', // 1 / 3 형태
    },
    loop: false, // 필요시 true
  });
}

function serviceSlide() {
  const swiperService = new Swiper('.serviceSwiper', {
    navigation: {
      nextEl: '.serviceSwiper .swiper-button-next',
      prevEl: '.serviceSwiper .swiper-button-prev',
    },
    pagination: {
      el: '.serviceSwiper .swiper-pagination',
      type: 'fraction', // 1 / 3 형태
    },
    loop: false,
    slidesPerView: 1,
    spaceBetween: 0,
  });
}


// 함수 정의: 요소가 화면에 보이는지 확인하는 함수
function elementInView(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var elemTop = $(elem).offset().top;
  return elemTop <= docViewBottom && elemTop >= docViewTop;
}
$(window).on('load scroll', function () {
  $('.counting-value').each(function () {
    var $this = $(this);
    // 요소가 화면에 보이면 애니메이션 시작
    if (elementInView($this) && !$this.data('animated')) {
      var countValue = parseInt($this.attr('count-value'));
      $this.prop('Counter', 0);
      $this.data('animated', true);
      setTimeout(function () {
        $({ Counter: 0 }).animate(
          { Counter: countValue },
          {
            duration: 500,
            easing: 'linear',
            step: function (now) {
              $this.text(Math.ceil(now).toLocaleString());
            },
          },
        );
      }, 300);
    }
  });
});

// Tooltip 기능
function tooltipInit() {
  $('.tooltipOpen').each(function () {
    const $tooltipOpen = $(this);
    // 다음 형제 요소에서 tooltip 찾기
    let $tooltip = $tooltipOpen.next('.tooltip');

    // 다음 형제에 없으면 부모 요소 내에서 찾기
    if ($tooltip.length === 0) {
      $tooltip = $tooltipOpen.parent().find('.tooltip').first();
    }

    if ($tooltip.length === 0) {
      return;
    }

    // tooltip을 body로 이동 (fixed 위치를 위해)
    if ($tooltip.parent()[0] !== document.body) {
      $tooltip.appendTo('body');
    }

    // 위치 계산 함수
    function updateTooltipPosition() {
      const offset = $tooltipOpen.offset();
      const tooltipOpenWidth = $tooltipOpen.outerWidth();
      const tooltipOpenHeight = $tooltipOpen.outerHeight();
      const tooltipWidth = $tooltip.outerWidth();

      // tooltipOpen 요소 아래 중앙에 위치
      const left = offset.left + (tooltipOpenWidth / 2) - (tooltipWidth / 2);
      const top = offset.top + tooltipOpenHeight + 8; // 8px 간격

      $tooltip.css({
        left: left + 'px',
        top: top + 'px'
      });
    }

    $tooltipOpen.on('mouseenter', function () {
      updateTooltipPosition();
      $tooltip.addClass('show');
    });

    $tooltipOpen.on('mouseleave', function () {
      $tooltip.removeClass('show');
    });

    // 스크롤 시 위치 업데이트
    $(window).on('scroll resize', function () {
      if ($tooltip.hasClass('show')) {
        updateTooltipPosition();
      }
    });
  });
}

// Tree Menu 기능
function treeMenuInit() {
  // 초기화: 하위 메뉴가 있는 항목에 has-children 클래스 추가
  $('.tree-item').each(function () {
    const $treeItem = $(this);
    const $submenu = $treeItem.children('.tree-submenu');

    if ($submenu.length > 0) {
      $treeItem.addClass('has-children');
    }
  });

  // 모든 tree-link에 클릭 이벤트 추가
  $(document).on('click', '.tree-link', function (e) {
    e.preventDefault();
    const $link = $(this);
    const $treeItem = $link.closest('.tree-item');
    const $submenu = $treeItem.children('.tree-submenu');

    // 하위 메뉴가 있는 경우 확장/축소 (수동 전환만)
    if ($submenu.length > 0) {
      $treeItem.toggleClass('expanded');
    }

    // 전체 트리 메뉴에서 모든 on 클래스 제거
    $('.tree-link').removeClass('on');

    // 클릭한 링크에만 on 클래스 추가 (마지막 선택 항목)
    $link.addClass('on');
  });
}