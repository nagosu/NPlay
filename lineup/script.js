$(document).ready(function () {
  // 팀 선택 버튼 클릭 시 active 클래스 부여
  $('.team-selector button').on('click', function () {
    $(this).addClass('active').siblings().removeClass('active');
  });

  // .player 요소 클릭 시 focused 클래스 부여 / 선택 폼을 해당 위치로 이동시킴
  $(document).on('click', '.player', function () {
    const $this = $(this);

    // 이미 .set 또는 .pitcher로 등록된 player일 경우, 이전에 저장한 선택 데이터를 기준으로 초기화
    if ($this.hasClass('set') || $this.hasClass('pitcher')) {
      const prevPlayer = $this.data('selectedPlayer');
      const prevPosition = $this.data('selectedPosition');

      // 이전에 선택한 선수명을 가진 항목에서 selected 클래스 제거
      if (prevPlayer) {
        $('.select-form .select-col:not(:last-child) .select-item')
          .filter(function () {
            return $(this).text().trim().indexOf(prevPlayer) === 0;
          })
          .removeClass('selected');
      }

      // 이전에 선택한 포지션을 가진 항목에서 selected 클래스 제거
      if (prevPosition) {
        $('.select-form .select-item.position')
          .filter(function () {
            return $(this).text().trim() === prevPosition;
          })
          .removeClass('selected');
      }

      // player 내부에 표시된 이름, 번호, 포지션 초기화
      $this.find('span').eq(1).text('');
      $this.find('span').eq(2).text('');
      $this.find('span').eq(3).text('');

      // set, pitcher 클래스 제거 및 데이터 초기화
      $this.removeClass('set pitcher');
      $this.removeData('selectedPlayer selectedPosition');
    }

    // 기존에 focused 클래스가 있던 player에서 제거 후, 현재 player에 추가
    $('.player.focused').removeClass('focused');
    $this.addClass('focused');

    // 선택 폼을 현재 player 위치로 이동시키고 상태 업데이트
    const $selectForm = $('.select-form');
    $selectForm.slideUp(500, function () {
      $this.after($selectForm);
      updateSelectedInForm($selectForm);
      $selectForm.slideDown(500);
    });
  });

  // select-item 클릭 시 focused 상태 토글 / 선수와 포지션이 모두 선택되면 폼을 닫음
  $(document).on('click', '.select-item', function () {
    const $this = $(this);
    const text = $this.text().trim();

    // 이미 선택된 항목은 재선택 방지
    if ($this.hasClass('selected')) return;

    if ($this.hasClass('position')) {
      // 포지션 중복 선택 방지
      const isDuplicate =
        $('.select-item.selected.position').filter(function () {
          return $(this).text().trim() === text;
        }).length > 0;
      if (isDuplicate) return;

      // 클릭한 포지션이 이미 focused 상태이면 해제
      if ($this.hasClass('focused')) {
        $this.removeClass('focused');
        return;
      }

      // 같은 포지션 열 내 기존 focused 해제 후 현재 항목에 focused 부여
      $this.siblings().removeClass('focused');
      $this.addClass('focused');
    } else {
      // 동일한 이름의 선수가 이미 선택된 경우 중복 선택 방지
      const isDuplicate =
        $('.select-item.selected:not(.position)').filter(function () {
          return $(this).text().trim() === text;
        }).length > 0;
      if (isDuplicate) return;

      // 이미 focused 상태이면 해제
      if ($this.hasClass('focused')) {
        $this.removeClass('focused');
        return;
      }

      // 다른 학년의 선택 항목에서 focused 클래스 제거
      $('.select-col:not(:last-child) .select-item').removeClass('focused');

      // 현재 항목에 focused 클래스 부여
      $this.addClass('focused');
    }

    // 선수와 포지션이 모두 선택된 경우에만 선택 폼을 닫음
    const hasPlayer = $('.select-item.focused:not(.position)').length > 0;
    const hasPosition = $('.select-item.focused.position').length > 0;

    if (hasPlayer && hasPosition) {
      closeSelectForm();
    }
  });

  // 선택 폼 닫기 및 다음 player 항목으로 이동
  function closeSelectForm() {
    const $selectedPlayerItem = $(
      '.select-item.focused:not(.position)'
    ).first();
    const $selectedPositionItem = $('.select-item.focused.position').first();
    const selectedPlayerText = $selectedPlayerItem.text();
    const selectedPositionText = $selectedPositionItem.text();

    let playerName = selectedPlayerText;
    let playerNumber = '';

    // 선수명에서 백넘버를 분리
    const match = selectedPlayerText.match(/(.*)\s*\((.*)\)/);
    if (match) {
      playerName = match[1].trim();
      playerNumber = match[2].trim();
    }

    const $currentPlayer = $('.player.focused');
    const $selectForm = $('.select-form');

    if ($currentPlayer.length) {
      // 현재 선택한 player에 이름, 번호, 포지션을 표시
      $currentPlayer.find('span').eq(1).text(playerName);
      $currentPlayer.find('span').eq(2).text(playerNumber);
      $currentPlayer.find('span').eq(3).text(selectedPositionText);

      // 기존 focused 제거
      $currentPlayer.removeClass('focused');

      // 포지션에 따라 클래스 지정
      if (selectedPositionText === '투수') {
        $currentPlayer.removeClass('set').addClass('pitcher');
      } else {
        $currentPlayer.addClass('set');
      }

      // 나중에 수정할 수 있도록 선택 데이터를 저장
      $currentPlayer.data('selectedPlayer', playerName);
      $currentPlayer.data('selectedPosition', selectedPositionText);
    }

    // 선택한 항목에 selected 부여 및 focused 해제
    $selectedPlayerItem.addClass('selected').removeClass('focused');
    $selectedPositionItem.addClass('selected').removeClass('focused');

    // 아직 선택되지 않은 다음 player를 찾아 focused 지정 및 선택폼 이동
    const $nextPlayer = $('.player')
      .filter(function () {
        return !$(this).hasClass('set') && !$(this).hasClass('pitcher');
      })
      .first();

    if ($nextPlayer.length) {
      $nextPlayer.addClass('focused');
      $selectForm.slideUp(500, function () {
        $nextPlayer.after($selectForm);
        updateSelectedInForm($selectForm);
        $selectForm.slideDown(500);
      });
    } else {
      // 모든 선수가 선택 완료되었으면 선택폼을 닫음
      $selectForm.slideUp(500);
    }
  }

  // 선택 폼 내 항목들의 selected 및 focused 상태를 최신 상태로 갱신
  function updateSelectedInForm($form) {
    $form.find('.select-item').each(function () {
      const $item = $(this);
      const text = $item.text().trim();

      // 현재 선택된 텍스트와 일치하는 항목에만 selected 클래스 유지
      const isSelected =
        $('.select-item.selected').filter(function () {
          return $(this).text().trim() === text;
        }).length > 0;

      if (isSelected) {
        $item.addClass('selected');
      } else {
        $item.removeClass('selected');
      }

      // 모든 항목의 focused 클래스 제거
      $item.removeClass('focused');
    });
  }
});
