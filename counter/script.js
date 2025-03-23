$(document).ready(function () {
  // 이닝 관련 변수
  let inningIndex = 0;
  const innings = [
    '1 회초',
    '1 회말',
    '2 회초',
    '2 회말',
    '3 회초',
    '3 회말',
    '4 회초',
    '4 회말',
    '5 회초',
    '5 회말',
    '6 회초',
    '6 회말',
    '7 회초',
    '7 회말',
    '8 회초',
    '8 회말',
    '9 회초',
    '9 회말',
    '10 회초',
    '10 회말',
    '11 회초',
    '11 회말',
    '12 회초',
    '12 회말',
  ];

  // 초기 이닝 설정
  $('.inning-control span').text(innings[inningIndex]);

  // 이닝 변경 버튼 클릭 이벤트
  $('.inning-control button').on('click', function () {
    let alt = $(this).find('img').attr('alt');
    if (alt === 'prev' && inningIndex > 0) {
      inningIndex--;
      // 이전 이닝으로 갈 때는 베이스와 카운트 초기화하지 않음
    } else if (alt === 'next' && inningIndex < innings.length - 1) {
      inningIndex++;
      // 다음 이닝으로 전환 시 베이스와 모든 카운트 초기화
      resetAllCounts();
      $('.base').removeClass('active');
    }
    $('.inning-control span').text(innings[inningIndex]);
  });

  // 점수 조정 버튼 클릭 이벤트
  $('.score-button-wrapper .score-button').on('click', function () {
    let $score = $(this).closest('.score-wrapper').find('.score');
    let currentScore = parseInt($score.text(), 10);

    if ($(this).find('img').attr('alt') === 'plus') {
      $score.text(currentScore + 1);
    } else if (
      $(this).find('img').attr('alt') === 'minus' &&
      currentScore > 0
    ) {
      $score.text(currentScore - 1);
    }
  });

  // 베이스 클릭 시 활성화 토글 (fade 효과)
  $('.base').on('click', function () {
    $(this).fadeTo(250, 0, function () {
      $(this).toggleClass('active').fadeTo(250, 1);
    });
  });

  // 베이스 리셋 버튼 클릭 시 모든 베이스 초기화
  $('.base-reset').on('click', function () {
    $('.base').removeClass('active');
  });

  // 볼, 스트라이크, 아웃 카운트 클릭 이벤트 (fade 효과 적용)
  $('.count.ball, .count.strike, .count.out').on('click', function () {
    let $this = $(this);
    $this.fadeTo(250, 0, function () {
      $this.toggleClass('active').fadeTo(250, 1, function () {
        // 각 그룹 내 active 상태를 왼쪽부터 채우도록 재정렬
        reorderCountGroup('ball');
        reorderCountGroup('strike');
        reorderCountGroup('out');

        let ballCount = $('.count.ball.active').length;
        let strikeCount = $('.count.strike.active').length;
        let outCount = $('.count.out.active').length;

        // 볼 4개 -> 볼, 스트라이크 초기화 후 주자 진루
        if (ballCount === 4) {
          resetBallAndStrike();
          advanceRunner();
        }

        // 스트라이크 3개 -> 볼, 스트라이크 초기화 후 아웃 카운트 증가
        if (strikeCount === 3) {
          resetBallAndStrike();
          advanceOut();
        }

        // 아웃 3개 -> 모든 카운트와 베이스 초기화 후 다음 이닝으로 전환
        if ($('.count.out.active').length === 3) {
          resetAllCounts();
          $('.base').removeClass('active');
          nextInning();
        }
      });
    });
  });

  // 볼, 스트라이크, 아웃 리셋 버튼 클릭 이벤트
  $('.count-reset').on('click', function () {
    $(this).closest('.count-container').find('.count').removeClass('active');
  });

  // 볼 & 스트라이크 초기화 함수 (B/S)
  function resetBallAndStrike() {
    $('.count.ball, .count.strike').removeClass('active');
  }

  // 모든 카운트 초기화 함수 (B/S/O)
  function resetAllCounts() {
    $('.count.ball, .count.strike, .count.out').removeClass('active');
  }

  // 각 카운트 그룹을 왼쪽부터 채움
  function reorderCountGroup(type) {
    let $group = $('.count.' + type);
    let activeCount = $group.filter('.active').length;
    // 모든 항목에서 active 제거 후, 왼쪽부터 active 재설정
    $group.removeClass('active');
    $group.slice(0, activeCount).addClass('active');
  }

  // 볼넷 -> 주자 진루
  function advanceRunner() {
    let firstBase = $('.base').eq(2); // 1루
    let secondBase = $('.base').eq(0); // 2루
    let thirdBase = $('.base').eq(1); // 3루

    if (!firstBase.hasClass('active')) {
      firstBase.addClass('active');
      return;
    }
    if (!secondBase.hasClass('active')) {
      firstBase.removeClass('active');
      secondBase.addClass('active');
      firstBase.addClass('active');
      return;
    }
    if (!thirdBase.hasClass('active')) {
      secondBase.removeClass('active');
      thirdBase.addClass('active');
      firstBase.removeClass('active');
      secondBase.addClass('active');
      firstBase.addClass('active');
      return;
    }
    // 만루 상황: 3루 주자 제거 후 나머지 한 베이스씩 이동
    thirdBase.removeClass('active');
    secondBase.removeClass('active');
    thirdBase.addClass('active');
    firstBase.removeClass('active');
    secondBase.addClass('active');
    firstBase.addClass('active');
  }

  // 아웃 카운트 증가
  function advanceOut() {
    let outCount = $('.count.out.active').length;
    if (outCount < 3) {
      $('.count.out').eq(outCount).addClass('active');
    }
  }

  // 다음 이닝으로 전환
  function nextInning() {
    if (inningIndex < innings.length - 1) {
      inningIndex++;
      $('.inning-control span').text(innings[inningIndex]);
      // 다음 이닝 전환 시 모든 카운트와 베이스 초기화
      resetAllCounts();
      $('.base').removeClass('active');
    }
  }
});
