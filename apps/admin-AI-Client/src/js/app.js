'use strict';
import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';
import localeKo from 'air-datepicker/locale/ko';
import hljs from 'highlight.js';

function initCodeHighlight() {
  document.querySelectorAll('.codearea pre code').forEach(function (el) {
    if (el.classList.contains('hljs')) {
      return;
    }
    hljs.highlightElement(el);
  });
}

function initCodeBlockCopy() {
  $(document).on('click', '.chat-code-block-copy', function (e) {
    e.preventDefault();
    const codeEl = $(this).closest('.chat-code-block').find('pre code')[0];
    if (!codeEl) {
      return;
    }
    const text = codeEl.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () { });
    }
  });
}

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
  // updateFilePath();
  sideNavUi();
  clickModal();
  progressUi();
  dropDownUi();
  // moreOptionsList();
  switchUi();
  customSelectUi();
  gnbToggle();
  settingsMenuToggle();
  initSttRangeCalendar();
  favoriteGroupUi();
  tableTextTooltipInit();
  updateStickyItemHeight();
  favoriteToggle();
  menuNameTooltip();
  initCodeHighlight();
  initCodeBlockCopy();
  filterPanelUi();
  settingTitArrowToggleUi();
  initGuideDatepicker();

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

function initGuideDatepicker() {
  const $inputs = $('.date-air-datepicker');
  if (!$inputs.length) return;

  $inputs.each(function () {
    const $input = $(this);
    if ($input.data('airDatepickerBound')) return;

    new AirDatepicker(this, {
      autoClose: true,
      locale: localeKo,
      dateFormat: 'yyyy.MM.dd'
    });

    $input.data('airDatepickerBound', true);
  });
}

/** STTList: 검색 줄 · 검색조건 · 날짜 필터 패널 UI */
function filterPanelUi() {
  $(document).on('click', '.searchlineOpen', function (e) {
    e.preventDefault();
    $(this).closest('.panel-head').find('.searchline').addClass('active');
    updateStickyItemHeight();
  });
  $(document).on('click', '.searchlineClose', function (e) {
    e.preventDefault();
    $(this).closest('.searchline').removeClass('active');
    updateStickyItemHeight();
    $('.filter-panel.filter-basic').removeClass('active');
  });
  $(document).on('click', '.filterPanelBasicOpen', function (e) {
    e.preventDefault();
    const $btn = $(this);
    const $filterPanel = $btn.closest('.panel').find('.filter-panel.filter-basic');
    $btn.toggleClass('on');
    $filterPanel.toggleClass('active');
    updateStickyItemHeight();
  });
  $(document).on('click', '.filterPanelCalendarOpen', function (e) {
    e.preventDefault();
    const $btn = $(this);
    const $filterPanel = $btn.closest('.panel').find('.filter-panel.filter-calendar');
    $btn.toggleClass('on');
    $filterPanel.toggleClass('active');
    updateStickyItemHeight();
  });
}

/** aiBoardEdit: setting-tit.arrow 클릭 시 다음 형제 filter-table 열기/닫기 */
function settingTitArrowToggleUi() {
  $(document).on('click', '.setting-tit.arrow', function (e) {
    // anchor/button 기본 이동 방지
    e.preventDefault();
    $(this).toggleClass('on');
  });
}

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
  const $settingsBtns = $('.user-settings');
  if (!$settingsBtns.length) return;

  function getTargetDropdown($btn) {
    const $closestMenu = $btn.closest('.settings-menu');
    if ($closestMenu.length) {
      const $menuDropdown = $closestMenu.find('.settings-dropdown').first();
      if ($menuDropdown.length) return $menuDropdown;
    }
    return $btn.siblings('.settings-dropdown').first();
  }

  function closeAllDropdowns() {
    $('.settings-dropdown.open').removeClass('open');
    $settingsBtns.removeClass('active');
  }

  function updateDropdownPosition($btn, $dropdown) {
    if (!$btn.length || !$dropdown.length || !$dropdown.hasClass('open')) return;

    const btnOffset = $btn.offset();
    const btnWidth = $btn.outerWidth();
    const btnHeight = $btn.outerHeight();
    const dropdownWidth = $dropdown.outerWidth();
    const dropdownHeight = $dropdown.outerHeight();
    const btnLeft = btnOffset.left;
    const btnTop = btnOffset.top;
    const btnRight = btnLeft + btnWidth;
    const btnBottom = btnTop + btnHeight;
    const gap = 8;
    const viewportGap = 8;
    let left = btnRight - dropdownWidth;
    let top = btnBottom + gap;

    if ($btn.hasClass('left')) {
      left = btnLeft - dropdownWidth - gap;
      top = btnTop + ((btnHeight - dropdownHeight) / 2);
    } else if ($btn.hasClass('right')) {
      left = btnRight + gap;
      top = btnTop + ((btnHeight - dropdownHeight) / 2);
    } else if ($btn.hasClass('top')) {
      left = btnRight - dropdownWidth;
      top = btnTop - dropdownHeight - gap;
    } else if ($btn.hasClass('btm')) {
      left = btnRight - dropdownWidth;
      top = btnBottom + gap;
    }

    const maxLeft = $(window).width() - dropdownWidth - viewportGap;
    const maxTop = $(window).height() - dropdownHeight - viewportGap;
    if (left < viewportGap) left = viewportGap;
    if (left > maxLeft) left = maxLeft;
    if (top < viewportGap) top = viewportGap;
    if (top > maxTop) top = maxTop;

    $dropdown.css({
      position: 'fixed',
      left: left + 'px',
      top: top + 'px',
      right: 'auto',
      bottom: 'auto'
    });
  }

  $settingsBtns.each(function () {
    const $btn = $(this);
    const $dropdown = getTargetDropdown($btn);
    if (!$dropdown.length) return;

    $btn.data('targetDropdown', $dropdown);
    $dropdown.data('anchorButton', $btn);

    if (!$dropdown.parent().is('body')) {
      $dropdown.appendTo('body');
      $dropdown.addClass('settings-dropdown-portal');
    }
  });

  $settingsBtns.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const $btn = $(this);
    const $dropdown = $btn.data('targetDropdown');
    if (!$dropdown || !$dropdown.length) return;
    const isOpen = $dropdown.hasClass('open');

    closeAllDropdowns();

    if (!isOpen) {
      $btn.addClass('active');
      $dropdown.addClass('open');
      updateDropdownPosition($btn, $dropdown);
    }
  });

  $(window).on('scroll.settings-dropdown resize.settings-dropdown', function () {
    $('.settings-dropdown.open').each(function () {
      const $dropdown = $(this);
      const $btn = $dropdown.data('anchorButton');
      updateDropdownPosition($btn, $dropdown);
    });
  });

  $('.settings-dropdown').on('click', function (e) {
    e.stopPropagation();
  });

  $('.settings-dropdown .settings-menu-item').on('click', function () {
    const action = $(this).data('action');
    switch (action) {
      case 'profile':
        console.log('프로필 설정 클릭');
        break;
      case 'memory':
        console.log('메모리 관리 클릭');
        break;
      case 'prompt':
        console.log('지침(프롬프트 설정) 클릭');
        break;
    }
  });

  $(document).on('click.settings-menu', function () {
    closeAllDropdowns();
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

function favoriteGroupUi() {
  const $groupHeads = $('.favorite-group .favorite-group-head');
  if (!$groupHeads.length) return;

  $groupHeads.on('click', function (e) {
    // 그룹 메뉴(점3개) 버튼 클릭은 접힘/펼침에서 제외
    if ($(e.target).closest('.user-settings').length) return;

    const $group = $(this).closest('.favorite-group');
    $group.toggleClass('open');
  });

  $('.favorite-group .favorite-group-toggle').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).closest('.favorite-group').toggleClass('open');
  });
}

function initSttRangeCalendar() {
  const $wrap = $('.date-range-calendar');
  if (!$wrap.length) return;

  const $start = $('#date-range-start');
  const $end = $('#date-range-end');
  const $presetBtns = $wrap.find('.range-preset-btn');
  const $rangeText = $('#selected-range-text');
  if (!$start.length || !$end.length) return;

  let selectedStart = null;
  let selectedEnd = null;
  let leftMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let isSyncing = false;
  let startPicker;
  let endPicker;

  function normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isSameDate(a, b) {
    return a && b && a.getTime() === b.getTime();
  }

  function addMonths(date, amount) {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  }

  function inRange(date) {
    if (!selectedStart || !selectedEnd) return false;
    const current = normalizeDate(date);
    return current >= selectedStart && current <= selectedEnd;
  }

  function dateClass(date) {
    const current = normalizeDate(date);

    if (selectedStart && isSameDate(current, selectedStart) && selectedEnd && isSameDate(current, selectedEnd)) {
      return 'range-start range-end';
    }
    if (selectedStart && isSameDate(current, selectedStart)) {
      return 'range-start';
    }
    if (selectedEnd && isSameDate(current, selectedEnd)) {
      return 'range-end';
    }
    if (inRange(current)) {
      return 'in-range';
    }
    return '';
  }

  function refreshCalendars() {
    if (!startPicker || !endPicker) return;
    startPicker.update({});
    endPicker.update({});
    updateRangeText();
  }

  function formatDate(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }

  function updateRangeText() {
    if (!$rangeText.length) return;
    if (selectedStart && selectedEnd) {
      $rangeText.text(`${formatDate(selectedStart)} ~ ${formatDate(selectedEnd)}`);
      return;
    }
    if (selectedStart && !selectedEnd) {
      $rangeText.text(`${formatDate(selectedStart)} ~ 종료일 선택`);
      return;
    }
    $rangeText.text('선택된 기간이 없습니다.');
  }

  function setRange(startDate, endDate) {
    selectedStart = normalizeDate(startDate);
    selectedEnd = normalizeDate(endDate);
    startPicker.clear({ silent: true });
    endPicker.clear({ silent: true });
    refreshCalendars();
  }

  function setStartOnly(startDate) {
    selectedStart = normalizeDate(startDate);
    selectedEnd = null;
    startPicker.clear({ silent: true });
    endPicker.clear({ silent: true });
    refreshCalendars();
  }

  function handleSelect(date) {
    const picked = normalizeDate(date);
    $presetBtns.removeClass('active');
    $presetBtns.filter('[data-range="custom"]').addClass('active');

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // 새 범위 선택 시작 시 기존 active 흔적 제거
      startPicker.clear({ silent: true });
      endPicker.clear({ silent: true });
      selectedStart = picked;
      selectedEnd = null;
    } else {
      if (picked < selectedStart) {
        selectedEnd = selectedStart;
        selectedStart = picked;
      } else {
        selectedEnd = picked;
      }
    }
    refreshCalendars();
  }

  function syncViewDates() {
    if (!startPicker || !endPicker) return;
    isSyncing = true;
    startPicker.setViewDate(leftMonth);
    endPicker.setViewDate(addMonths(leftMonth, 1));
    isSyncing = false;
    refreshCalendars();
  }

  function buildOptions(side) {
    return {
      inline: true,
      autoClose: false,
      locale: localeKo,
      classes: side === 'left' ? 'date-range-datepicker is-left' : 'date-range-datepicker is-right',
      viewDate: side === 'left' ? leftMonth : addMonths(leftMonth, 1),
      prevHtml: '&lt;',
      nextHtml: '&gt;',
      onRenderCell: function ({ date, cellType }) {
        if (cellType !== 'day') return {};
        const day = date.getDay();
        const weekendClass = day === 0 ? 'is-sun' : (day === 6 ? 'is-sat' : '');
        const rangeClass = dateClass(date);
        const classes = [rangeClass, weekendClass].filter(Boolean).join(' ');
        return {
          classes: classes
        };
      },
      onSelect: function ({ date }) {
        if (!date) return;
        handleSelect(date);
      },
      onChangeViewDate: function ({ month, year }) {
        if (isSyncing) return;
        const changedMonth = new Date(year, month, 1);

        if (side === 'left') {
          leftMonth = changedMonth;
        } else {
          leftMonth = addMonths(changedMonth, -1);
        }
        syncViewDates();
      }
    };
  }

  startPicker = new AirDatepicker($start[0], buildOptions('left'));
  endPicker = new AirDatepicker($end[0], buildOptions('right'));
  syncViewDates();

  // 최초 로드 시 선택값 없음
  startPicker.clear({ silent: true });
  endPicker.clear({ silent: true });
  selectedStart = null;
  selectedEnd = null;
  refreshCalendars();

  function subtractMonthsSafely(baseDate, months) {
    const safeDate = normalizeDate(baseDate);
    const targetDay = safeDate.getDate();
    safeDate.setDate(1);
    safeDate.setMonth(safeDate.getMonth() - months);
    const lastDay = new Date(safeDate.getFullYear(), safeDate.getMonth() + 1, 0).getDate();
    safeDate.setDate(Math.min(targetDay, lastDay));
    return safeDate;
  }

  $presetBtns.on('click', function () {
    const $btn = $(this);
    const rangeType = $btn.data('range');
    const end = normalizeDate(new Date());
    let start = normalizeDate(new Date());

    if (rangeType === '7d') {
      start.setDate(end.getDate() - 6);
    } else if (rangeType === '1m') {
      start = subtractMonthsSafely(end, 1);
    } else if (rangeType === '3m') {
      // 현재 월 포함 최근 3개월: (현재월 - 2개월)의 1일 ~ 오늘
      start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
    } else {
      $presetBtns.removeClass('active');
      $btn.addClass('active');
      return;
    }

    $presetBtns.removeClass('active');
    $btn.addClass('active');
    setRange(start, end);
  });
}


function menuNameTooltip() {
  if (window.__titleLabelTooltipInitialized) return;
  window.__titleLabelTooltipInitialized = true;

  const tooltipMap = new Map();

  function setTooltipPosition(target, tooltip) {
    const rect = target.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const gap = 8;

    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.top - tooltipHeight - gap;

    const minViewportGap = 8;
    if (left < minViewportGap) {
      left = minViewportGap;
    }
    if (left + tooltipWidth > window.innerWidth - minViewportGap) {
      left = window.innerWidth - tooltipWidth - minViewportGap;
    }

    if (top < minViewportGap) {
      top = rect.bottom + gap;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function showTitleLabel(target) {
    const labelText = target.getAttribute('title-label');
    if (!labelText) return;
    if (tooltipMap.has(target)) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'title-label';
    tooltip.textContent = labelText;
    document.body.appendChild(tooltip);
    setTooltipPosition(target, tooltip);
    tooltipMap.set(target, tooltip);
  }

  function hideTitleLabel(target) {
    const tooltip = tooltipMap.get(target);
    if (tooltip) {
      tooltip.remove();
      tooltipMap.delete(target);
    }
  }

  function updateOpenedTooltips() {
    tooltipMap.forEach(function (tooltip, target) {
      if (!document.body.contains(target)) {
        tooltip.remove();
        tooltipMap.delete(target);
        return;
      }
      setTooltipPosition(target, tooltip);
    });
  }

  window.addEventListener('scroll', updateOpenedTooltips, true);
  window.addEventListener('resize', updateOpenedTooltips);

  document.addEventListener('mouseover', function (event) {
    const target = event.target.closest('[title-label]');
    if (!target) return;
    if (target.contains(event.relatedTarget)) return;
    showTitleLabel(target);
  });

  document.addEventListener('mouseout', function (event) {
    const target = event.target.closest('[title-label]');
    if (!target) return;
    if (target.contains(event.relatedTarget)) return;
    hideTitleLabel(target);
  });

  document.addEventListener('focusin', function (event) {
    const target = event.target.closest('[title-label]');
    if (!target) return;
    showTitleLabel(target);
  });

  document.addEventListener('focusout', function (event) {
    const target = event.target.closest('[title-label]');
    if (!target) return;
    hideTitleLabel(target);
  });
}
