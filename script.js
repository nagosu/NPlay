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
    // 이전 이닝 버튼 클릭 시 인덱스 감소 (첫 이닝까지)
    if ($(this).find('img').attr('alt') === 'prev' && inningIndex > 0) {
      inningIndex--;
    }
    // 다음 이닝 버튼 클릭 시 인덱스 증가 (마지막 이닝까지)
    else if (
      $(this).find('img').attr('alt') === 'next' &&
      inningIndex < innings.length - 1
    ) {
      inningIndex++;
    }
    // 변경된 이닝 텍스트 업데이트
    $('.inning-control span').text(innings[inningIndex]);
  });

  // 점수 조정 버튼 클릭 이벤트
  $('.score-button-wrapper .score-button').on('click', function () {
    let $score = $(this).closest('.score-wrapper').find('.score');
    let currentScore = parseInt($score.text());

    // 점수 증가 버튼 클릭 시 +1
    if ($(this).find('img').attr('alt') === 'plus') {
      $score.text(currentScore + 1);
    }
    // 점수 감소 버튼 클릭 시 (0까지)
    else if ($(this).find('img').attr('alt') === 'minus' && currentScore > 0) {
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

  // 볼, 스트라이크, 아웃 카운트 클릭 이벤트 (fade 효과)
  $('.count.ball, .count.strike, .count.out').on('click', function () {
    let $this = $(this);
    $this.fadeTo(250, 0, function () {
      $this.toggleClass('active').fadeTo(250, 1, function () {
        let ballCount = $('.count.ball.active').length;
        let strikeCount = $('.count.strike.active').length;
        let outCount = $('.count.out.active').length;

        // 볼 4개 -> 볼, 스트라이크 초기화 후 주자 진루
        if (ballCount === 4) {
          resetBallAndStrike(); // 볼, 스트라이크 초기화
          advanceRunner(); // 주자 진루
        }

        // 스트라이크 3개 -> 볼, 스트라이크 초기화 후 아웃 카운트 증가
        if (strikeCount === 3) {
          resetBallAndStrike(); // 볼, 스트라이크 초기화
          advanceOut(); // 아웃 카운트 증가
        }

        // 아웃 3개 -> 모든 카운트 초기화 후 이닝 자동 전환
        if ($('.count.out.active').length === 3) {
          resetAllCounts(); // 모든 카운트 초기화
          $('.base').removeClass('active'); // 모든 베이스 초기화
          nextInning(); // 다음 이닝으로 전환
        }
      });
    });
  });

  // 볼, 스트라이크, 아웃 리셋 버튼 클릭 이벤트
  $('.count-reset').on('click', function () {
    $(this).closest('.count-container').find('.count').removeClass('active');
  });

  // 볼 & 스트라이크 초기화 (B/S)
  function resetBallAndStrike() {
    $('.count.ball, .count.strike').removeClass('active');
  }

  // 모든 카운트 초기화 함수 (B/S/O)
  function resetAllCounts() {
    $('.count.ball, .count.strike, .count.out').removeClass('active');
  }

  // 볼넷 -> 주자 진루
  function advanceRunner() {
    let firstBase = $('.base').eq(2); // 1루
    let secondBase = $('.base').eq(0); // 2루
    let thirdBase = $('.base').eq(1); // 3루

    // 1루가 비어 있다면 1루 주자 배치
    if (!firstBase.hasClass('active')) {
      firstBase.addClass('active');
      return;
    }

    // 2루가 비어 있다면 1루 주자를 이동 후 1루 새 주자 배치
    if (!secondBase.hasClass('active')) {
      firstBase.removeClass('active');
      secondBase.addClass('active');
      firstBase.addClass('active');
      return;
    }

    // 3루가 비어 있다면 2루 주자를 이동 후 1, 2루 주자 유지
    if (!thirdBase.hasClass('active')) {
      secondBase.removeClass('active');
      thirdBase.addClass('active');
      firstBase.removeClass('active');
      secondBase.addClass('active');
      firstBase.addClass('active');
      return;
    }

    // 만루일 경우 3루 주자만 제거 후 나머지 한 베이스씩 이동
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
    }
  }
});
