'use strict';

// sticky-item 높이를 자동으로 계산하여 CSS 변수로 설정
function updateStickyItemHeight() {
  $('.sticy-item').each(function () {
    const $stickyItem = $(this);
    const height = $stickyItem.outerHeight();

    if (height > 0) {
      // .sticy-item의 다음 형제인 .content-view를 찾음
      const $contentView = $stickyItem.next('.content-view');

      if ($contentView.length) {
        // .content-view에 CSS 변수 설정
        $contentView[0].style.setProperty('--sticky-item-height', height + 'px');
        console.log('Sticky item height set to:', height + 'px');
      } else {
        // 같은 부모 내의 .content-view를 찾음
        const $parentContentView = $stickyItem.parent().find('.content-view');
        if ($parentContentView.length) {
          $parentContentView[0].style.setProperty('--sticky-item-height', height + 'px');
          console.log('Sticky item height set to:', height + 'px');
        }
      }
    }
  });
}

$(document).ready(function () {
  setScreenSize();
  $('.scrollbar').scrollbar(); // 스크롤디자인 라이브러리호출
  updateFilePath();
  sideNavUi();
  clickModal();
  progressUi();
  dropDownUi();
  moreOptionsList();
  switchUi();
  customSelectUi();
  gnbToggle();
  settingsMenuToggle();
  tableTextTooltipInit();
  updateStickyItemHeight();
  favoriteToggle();

  // 리사이즈 시 높이 재계산
  $(window).on('resize.sticky-item', function () {
    updateStickyItemHeight();
  });

  setTimeout(function () {
    defaultModal();
    datepicker();
    updateStickyItemHeight(); // 모달이나 다른 요소 로드 후 재계산
  }, 10);

  // DOM이 완전히 로드된 후 한 번 더 실행
  setTimeout(function () {
    updateStickyItemHeight();
  }, 100);
});
$(window).on('resize', function () {
  modalSize();
});

// 텍스트 말줄임표 툴팁 기능
function tableTextTooltipInit() {
  $('.text-ellipsis').each(function () {
    const $element = $(this);
    const fullText = $element.attr('data-full-text') || $element.text();
    const elementText = $element.text();

    // 텍스트가 잘렸는지 확인
    if (elementText.length === fullText.length && $element[0].scrollWidth <= $element[0].offsetWidth) {
      return; // 텍스트가 잘리지 않았으면 툴팁 불필요
    }

    // 툴팁 요소 생성
    const $tooltip = $('<div class="tooltip"></div>').text(fullText);
    $tooltip.appendTo('body');

    // 마우스 오버 이벤트
    $element.on('mouseenter', function () {
      const offset = $element.offset();
      const elementWidth = $element.outerWidth();
      const elementHeight = $element.outerHeight();
      const tooltipWidth = $tooltip.outerWidth();

      // 툴팁 위치 계산 (요소 아래 중앙)
      const left = offset.left + (elementWidth / 2) - (tooltipWidth / 2);
      const top = offset.top + elementHeight + 8; // 8px 간격

      $tooltip.css({
        left: left + 'px',
        top: top + 'px'
      }).addClass('show');
    });

    $element.on('mouseleave', function () {
      $tooltip.removeClass('show');
    });

    // 스크롤/리사이즈 시 위치 업데이트
    $(window).on('scroll resize', function () {
      if ($tooltip.hasClass('show')) {
        const offset = $element.offset();
        const elementWidth = $element.outerWidth();
        const elementHeight = $element.outerHeight();
        const tooltipWidth = $tooltip.outerWidth();

        const left = offset.left + (elementWidth / 2) - (tooltipWidth / 2);
        const top = offset.top + elementHeight + 8;

        $tooltip.css({
          left: left + 'px',
          top: top + 'px'
        });
      }
    });
  });
}

function switchUi() {
  $('.switch').each(function () {
    $(this).on('click', function () {
      if ($(this).hasClass('on')) {
        $(this).removeClass('on');
        $(this).find('input').attr('checked', false);
        return false;
      } else {
        $(this).addClass('on');
        $(this).find('input').attr('checked', true);
        return false;
      }
    });
  });
}
function moreOptionsList() {
  $('.list-option .ico.more').each(function () {
    $(this).on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $('.list-more-cont').removeClass('on');
      $(this).next('.list-more-cont').toggleClass('on');
    });
  });

  $(document).on('click', function () {
    $('.list-more-cont.on').removeClass('on');
  });

  $('.list-more-cont').on('click', function (e) {
    e.stopPropagation();
  });
}
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

function sideNavUi() {
  $('.menu-group .menu-item').each(function () {
    // arrow 클래스가 있는 a 태그를 찾습니다.
    const arrowLink = $(this).find('a.arrow');
    if (arrowLink.length) {
      // arrow 클래스가 있는 경우에만 이벤트 핸들러를 추가합니다.
      arrowLink.on('click', function (e) {
        e.preventDefault();

        // collapsed 상태에서 하위 메뉴 클릭 시 collapsed 해제
        if ($('#gnb').hasClass('collapsed')) {
          $('#gnb').removeClass('collapsed');
          if (typeof Storage !== 'undefined') {
            localStorage.setItem('gnbCollapsed', false);
          }
        }

        const menuItem = $(this).parents('.menu-item');

        // common
        menuItem.toggleClass('open').siblings('.menu-item').filter(function () {
          return $(this).find('a.arrow').length;
        }).removeClass('open');

        // all
        menuItem.parents('.nav-item').siblings('.nav-item').find('.menu-item').filter(function () {
          return $(this).find('a.arrow').length;
        }).removeClass('open');
      });
    }
  });
}

function dropDownUi() {
  $('.list-dropdown').each(function () {
    const Button = $(this).find('.dropdownButton');
    Button.on('click', function (e) {
      e.preventDefault();
      $(this).parents('li').toggleClass('on').siblings().removeClass('on');
      $(this).next('.dropdownContents').slideToggle().parents('li').siblings().find('.dropdownContents').slideUp();
    });
  });
}

function setScreenSize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
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

function customSelectUi() {
  $('.custom-select').each(function () {
    const $customSelect = $(this);

    // added 타입은 user-global-chat에서 처리하므로 제외
    if ($customSelect.hasClass('added')) {
      return;
    }

    const $button = $customSelect.find('.custom-select-button');
    const $text = $button.find('.custom-select-text');
    const $dropdown = $customSelect.find('.custom-select-dropdown');

    // 버튼 클릭 시 드롭다운 토글
    $button.on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      // 다른 커스텀 select 닫기
      $('.custom-select').not($customSelect).removeClass('open');
      $('.custom-select-dropdown').not($dropdown).removeClass('open');

      // 현재 select 토글
      $customSelect.toggleClass('open');
      $dropdown.toggleClass('open');
    });

    // 옵션 클릭 시 선택
    $dropdown.find('.custom-select-option').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $option = $(this);
      const value = $option.data('value');
      const text = $option.text();

      // 선택 상태 업데이트
      $dropdown.find('.custom-select-option').removeClass('selected');
      $option.addClass('selected');

      // 버튼 텍스트 업데이트
      if ($text.length) {
        $text.text(text);
      }

      // data-value 업데이트
      $customSelect.attr('data-value', value);

      // change 이벤트 발생
      $customSelect.trigger('change', [value, text]);

      // 드롭다운 닫기
      $customSelect.removeClass('open');
      $dropdown.removeClass('open');
    });

    // 외부 클릭 시 닫기
    $(document).on('click.custom-select-' + $customSelect.index(), function (e) {
      if (!$customSelect.is(e.target) && !$customSelect.has(e.target).length) {
        $customSelect.removeClass('open');
        $dropdown.removeClass('open');
      }
    });
  });
}

function gnbToggle() {
  $('.panel-toggle').on('click', function (e) {
    e.preventDefault();
    $('#gnb').toggleClass('collapsed');

    // 접힌 상태 저장 (선택사항)
    const isCollapsed = $('#gnb').hasClass('collapsed');
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('gnbCollapsed', isCollapsed);
    }
  });

  // 저장된 상태 복원 (선택사항)
  if (typeof Storage !== 'undefined') {
    const savedState = localStorage.getItem('gnbCollapsed');
    if (savedState === 'true') {
      $('#gnb').addClass('collapsed');
    }
  }
}

function settingsMenuToggle() {
  const $settingsBtn = $('.snb-btn.settings');
  const $settingsMenu = $settingsBtn.closest('.settings-menu');
  const $dropdown = $settingsMenu.find('.settings-dropdown');

  // settings-dropdown을 body 레벨로 이동 (sticky 요소 위에 표시하기 위해)
  if ($dropdown.length && $dropdown.parent().is('.settings-menu')) {
    $dropdown.appendTo('body');
    $dropdown.addClass('settings-dropdown-portal');
  }

  // 드롭다운 위치 업데이트 함수
  function updateDropdownPosition() {
    if ($dropdown.hasClass('open')) {
      const $btn = $settingsBtn;
      const btnOffset = $btn.offset();
      const btnWidth = $btn.outerWidth();
      const btnHeight = $btn.outerHeight();
      const dropdownWidth = $dropdown.outerWidth();

      $dropdown.css({
        position: 'fixed',
        top: (btnOffset.top + btnHeight + 8) + 'px',
        right: ($(window).width() - btnOffset.left - btnWidth) + 'px',
        left: 'auto'
      });
    }
  }

  // 설정 버튼 클릭 시 토글
  $settingsBtn.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    // 다른 드롭다운 닫기
    $('.settings-dropdown').not($dropdown).removeClass('open');
    $('.snb-btn.settings').not($settingsBtn).removeClass('active');

    // 현재 드롭다운 토글
    $settingsBtn.toggleClass('active');
    $dropdown.toggleClass('open');

    // 위치 업데이트
    updateDropdownPosition();
  });

  // 스크롤 및 리사이즈 시 위치 업데이트
  $(window).on('scroll.settings-dropdown resize.settings-dropdown', function () {
    if ($dropdown.hasClass('open')) {
      updateDropdownPosition();
    }
  });

  // 메뉴 항목 클릭 시
  $dropdown.find('.settings-menu-item').on('click', function (e) {
    const action = $(this).data('action');

    // 각 액션에 따른 처리
    switch (action) {
      case 'profile':
        console.log('프로필 설정 클릭');
        // 여기에 프로필 설정 기능 구현
        break;
      case 'memory':
        console.log('메모리 관리 클릭');
        // 여기에 메모리 관리 기능 구현
        break;
      case 'prompt':
        console.log('지침(프롬프트 설정) 클릭');
        // 여기에 프롬프트 설정 기능 구현
        break;
    }
  });

  // 외부 클릭 시 닫기
  $(document).on('click.settings-menu', function (e) {
    if (!$settingsMenu.is(e.target) && !$settingsMenu.has(e.target).length &&
      !$dropdown.is(e.target) && !$dropdown.has(e.target).length) {
      $dropdown.removeClass('open');
      $settingsBtn.removeClass('active');
    }
  });
}


function favoriteToggle() {
  $('.favorite').each(function () {
    $(this).on('click', function (e) {
      e.preventDefault();
      $(this).toggleClass('on');
    });
  });
}