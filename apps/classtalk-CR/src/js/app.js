

$(document).ready(function () {
  AOS.init();
  setScreenSize();
  dropDownUi(); // 드롭다운 이벤트
  innerTabUi(); // 페이지 내부 탭
  listBasicCheckbox(); // list-basic 체크박스 선택 이벤트
  // modal Show Demo
  if ($('.modal').length) {
    modalSampleScript(); // 공통 팝업 띄우기
  }
});



function setScreenSize() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}






function dropDownUi() {
  $('.dropdown').each(function () {
    $('.dropCont').hide();
    const Button = $(this).find('.dropBtn');
    Button.on('click', function (e) {
      e.preventDefault();
      $(this).toggleClass('on');
      $(this).prev('.dropCont').slideToggle();
    });
  });
}

function listBasicCheckbox() {
  $('.list-basic').on('change', 'input[type="checkbox"]', function () {
    const $checkbox = $(this);
    const $li = $checkbox.closest('li');

    if ($checkbox.is(':checked')) {
      $li.addClass('selected');
    } else {
      $li.removeClass('selected');
    }
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

