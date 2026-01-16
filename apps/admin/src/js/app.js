'use strict';
$(document).ready(function () {
  setScreenSize();
  $('.scrollbar').scrollbar(); // 스크롤디자인 라이브러리호출
  btnEvent();
  layoutSystem();
  gnbIconChange();
  updateFilePath();
  sideNavUi();
  clickModal();
  innerTabUi();
  progressUi();
  setTimeout(function () {
    commonSlide();
    defaultModal();
    datepicker();
  }, 10);
});
$(window).on('resize', function () {
  modalSize();
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
  $('.more-cont').each(function () {
    $(this).find('.ico.more').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $('.more-cont').removeClass('on'); // 모든 .more-cont 요소에서 on 클래스 제거
      $(this).parents('.more-cont').toggleClass('on');
    });
  });

  $(document).on('click', function () {
    $('.more-cont.on').removeClass('on');
  });

  $('.more-cont').on('click', function (e) {
    e.stopPropagation();
  });
  $('.favorite').on('click', function (e) {
    e.preventDefault();
    $(this).toggleClass('on');
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
      firstDay: 1,//  0: 일요일 부터 시작, 1:월요일 부터 시작
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

function sideNavUi() {
  $('.menu-group .menu-item').each(function () {
    // arrow 클래스가 있는 a 태그를 찾습니다.
    const arrowLink = $(this).find('a.arrow');
    if (arrowLink.length) {
      // arrow 클래스가 있는 경우에만 이벤트 핸들러를 추가합니다.
      arrowLink.on('click', function (e) {
        e.preventDefault();

        const menuItem = $(this).parents('.menu-item');

        // common
        menuItem.toggleClass('open').siblings('.menu-item').filter(function () {
          return $(this).find('a.arrow').length;
        }).removeClass('open');

        // all
        menuItem.parents('.nav-item').siblings('.nav-item').find('.menu-item').filter(function () {
          return $(this).find('a.arrow').length;
        }).removeClass('open');

        // gnbIconChange(menuItem.find("img"));
      });
    }
  });
}

function gnbIconChange(clickedImg) {
  // Remove -on from all menu-item images
  $(".menu-item img").each(function () {
    var src = $(this).attr("src");
    if (src.includes("-on")) {
      $(this).attr("src", src.replace("-on", ""));
    }
  });

  // Toggle the clicked menu-item image
  if (clickedImg) {
    var src = clickedImg.attr("src");
    if (!src.includes("-on")) {
      var newSrc = src.replace(".png", "-on.png");
      clickedImg.attr("src", newSrc);
    }
  }

  // Add -on to open menu-item images
  $(".menu-item.active img").each(function () {
    var src = $(this).attr("src");
    if (!src.includes("-on")) {
      var newSrc = src.replace(".png", "-on.png");
      $(this).attr("src", newSrc);
    }
  });
}

function setScreenSize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function layoutSystem() {
  // 사이드메뉴 닫기에 의한 레이아웃 조정
  $('.closeGnb').on('click', function (e) {
    e.preventDefault();
    $('.viewport').toggleClass('layout-simple');
    $('.MSG').fadeOut();

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