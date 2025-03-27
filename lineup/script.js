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
      if (!$this.hasClass('pitcher')) {
        $this.find('span').eq(1).text('');
        $this.find('span').eq(2).text('');
        $this.find('span').eq(3).text('');
      } else {
        // pitcher인 경우, 이름, 번호만 초기화
        $this.find('span').eq(1).text('');
        $this.find('span').eq(2).text('');

        // 일반 player 중 포지션이 투수인 항목도 초기화
        $('.player.set').each(function () {
          const $player = $(this);
          const posText = $player.find('span').eq(3).text().trim();
          if (posText === '투수' && !$player.hasClass('pitcher')) {
            $player.addClass('was-pitcher');
            $player.find('span').eq(1).text('');
            $player.find('span').eq(2).text('');
            $player.find('span').eq(3).text('');
            $player.removeClass('set disabled');
            $player.removeData('selectedPlayer selectedPosition');
          }
        });
      }

      // set 클래스 제거 및 데이터 초기화
      $this.removeClass('set');
      $this.removeData('selectedPlayer selectedPosition');
    }

    // 기존에 focused 클래스가 있던 player에서 제거 후, 현재 player에 추가
    $('.player.focused').removeClass('focused');
    $this.addClass('focused');

    if (!$this.hasClass('was-pitcher') && !$this.hasClass('pitcher')) {
      $('.player')
        .slice(0, 9)
        .each(function () {
          const pos = $(this).find('span').eq(3).text().trim();
          if (pos !== '투수') {
            $(this).removeClass('was-pitcher');
          }
        });
    }

    // 선택폼 이동 전 상태 초기화
    $('.select-item.position').removeClass('disabled');

    // 선택 폼을 현재 player 위치로 이동시키고 상태 업데이트
    const $selectForm = $('.select-form');
    $selectForm.slideUp(500, function () {
      $this.after($selectForm);

      // pitcher 클래스를 가진 player인 경우, 포지션 선택 항목을 투수로 제한
      if ($this.hasClass('pitcher')) {
        $('.select-item.position').each(function () {
          const text = $(this).text().trim();
          if (text !== '투수') {
            $(this).hide();
          } else {
            $(this).show();
          }
        });
      } else {
        // pitcher가 아닌 경우 모든 포지션 항목을 보이게 처리
        $('.select-item.position').show();
      }

      updateSelectedInForm($selectForm);

      // update 이후에 focused/disabled 부여
      if ($this.hasClass('pitcher')) {
        $('.select-item.position').each(function () {
          const text = $(this).text().trim();
          if (text === '투수') {
            $(this).addClass('disabled');
            // 이미 selected된 항목은 유지하고, 아닐 경우에만 focused 추가
            if (!$(this).hasClass('selected')) {
              $(this).addClass('focused');
            }
          }
        });

        // pitcher 박스 내부 span에서 이름을 직접 가져오기
        const pitcherName = $this.find('span').eq(1).text().trim(); // 이름
        const pitcherNumber = $this.find('span').eq(2).text().trim(); // 번호

        if (pitcherName) {
          // 이름 (번호) 형식으로 구성
          const fullText = pitcherNumber
            ? `${pitcherName} (${pitcherNumber})`
            : pitcherName;

          // select-item 중 텍스트가 일치하는 항목에 focused 추가
          $('.select-item:not(.position)').each(function () {
            if ($(this).text().trim() === fullText) {
              // ✅ 이미 selected된 항목은 유지하고, 아닐 경우에만 focused 추가
              if (!$(this).hasClass('selected')) {
                $(this).addClass('focused');
              }
            }
          });
        }
      }
      $selectForm.slideDown(500);
    });
  });

  // select-item 클릭 시 focused 상태 토글 / 선수와 포지션이 모두 선택되면 폼을 닫음
  $(document).on('click', '.select-item', function () {
    const $this = $(this);
    const text = $this.text().trim();

    // 이미 선택된 항목은 재선택 방지 + 모달 표시
    if ($this.hasClass('selected')) {
      if ($this.hasClass('position')) {
        openSelectedPositionModal(); // 포지션 중복 선택 시 모달
      } else {
        openSelectedPlayerModal(); // 선수 중복 선택 시 모달
      }
      return;
    }

    if ($this.hasClass('position')) {
      const selectedPosition = $this.text().trim();

      // 1~9번에 투수가 선택되어 있을 때, 지명타자를 선택하려는 경우
      const hasPitcherInLineup =
        $('.player.set').filter(function () {
          const pos = $(this).find('span').eq(3).text().trim();
          const index = $(this).index();
          return pos === '투수' && index < 10;
        }).length > 0;

      // 1~9번에 지명타자가 선택되어 있을 때, 투수를 선택하려는 경우
      const hasDhInLineup =
        $('.player.set').filter(function () {
          const pos = $(this).find('span').eq(3).text().trim();
          const index = $(this).index();
          return pos === '지명타자' && index < 10;
        }).length > 0;

      if (
        (selectedPosition === '지명타자' && hasPitcherInLineup) ||
        (selectedPosition === '투수' && hasDhInLineup)
      ) {
        openSelectedPositionModal(); // 지명타자 또는 투수 중복 선택 시 모달
        return;
      }

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
      if (!$currentPlayer.hasClass('pitcher')) {
        $currentPlayer.find('span').eq(3).text(selectedPositionText);
      }

      // 기존 focused 제거
      $currentPlayer.removeClass('focused');

      // set 클래스 지정
      if (!$currentPlayer.hasClass('pitcher')) {
        $currentPlayer.addClass('set');

        if (selectedPositionText === '투수') {
          // 투수인 경우 disabled 클래스 지정
          $currentPlayer.addClass('disabled');

          // 투수 박스에도 동일하게 정보 업데이트
          const $pitcherBox = $('.player.pitcher');
          $pitcherBox.find('span').eq(1).text(playerName);
          $pitcherBox.find('span').eq(2).text(playerNumber);

          // 선택 데이터 저장 (투수 박스에도 동일하게 저장)
          $pitcherBox.data('selectedPlayer', playerName);
          $pitcherBox.data('selectedPosition', selectedPositionText);
        }
      }

      // 나중에 수정할 수 있도록 선택 데이터를 저장
      $currentPlayer.data('selectedPlayer', playerName);
      $currentPlayer.data('selectedPosition', selectedPositionText);

      // pitcher 선택 시, 일반 투수 박스도 동기화
      if ($currentPlayer.hasClass('pitcher')) {
        $('.player.set').each(function () {
          const $player = $(this);
          const posText = $player.find('span').eq(3).text().trim();
          if (posText === '투수' && !$player.hasClass('pitcher')) {
            $player.find('span').eq(1).text(playerName);
            $player.find('span').eq(2).text(playerNumber);
            $player.data('selectedPlayer', playerName);
            $player.data('selectedPosition', selectedPositionText);
          }
        });

        // was-pitcher 클래스가 붙은 player에도 정보 반영
        $('.player.was-pitcher').each(function () {
          const $player = $(this);
          $player.find('span').eq(1).text(playerName);
          $player.find('span').eq(2).text(playerNumber);
          $player.find('span').eq(3).text(selectedPositionText);
          $player.data('selectedPlayer', playerName);
          $player.data('selectedPosition', selectedPositionText);
          $player.addClass('set disabled');
        });
      }
    }

    // 선택한 항목에 selected 부여 및 focused 해제
    if (
      $selectedPlayerItem.length !== 0 &&
      $selectedPositionItem.length !== 0
    ) {
      $selectedPlayerItem.addClass('selected').removeClass('focused');
      $selectedPositionItem.addClass('selected').removeClass('focused');
    }

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

    $('.select-item.position').removeClass('focused disabled').show();
  }

  // 선택 폼 내 항목들의 selected 및 focused 상태를 최신 상태로 갱신
  function updateSelectedInForm($form) {
    const hasPlayer =
      $form.find('.select-item.focused:not(.position)').length > 0;
    const hasPosition = $form.find('.select-item.focused.position').length > 0;

    $form.find('.select-item').each(function () {
      const $item = $(this);
      const text = $item.text().trim();

      const isSelected =
        $('.select-item.selected').filter(function () {
          return $(this).text().trim() === text;
        }).length > 0;

      const isFocused = $item.hasClass('focused');

      // selected는 focused가 둘 다 있는 경우에만 적용
      if (isFocused && hasPlayer && hasPosition) {
        $item.addClass('selected');
      } else if (!isSelected) {
        $item.removeClass('selected');
      }

      // focused는 무조건 제거
      $item.removeClass('focused');
    });
  }

  // 등록된 선수입니다 모달 열기
  function openSelectedPlayerModal() {
    $('.modal-overlay.pop-a').attr('style', 'display: flex');
  }

  // 등록된 선수입니다 모달 닫기
  function closeSelectedPlayerModal() {
    $('.modal-overlay.pop-a').fadeOut(200);
  }

  // 등록된 선수입니다 버튼 클릭 시 모달 열기
  $(document).on('click', '.modal-button.pop-a', function () {
    closeSelectedPlayerModal();
  });

  // 선택할 수 없습니다 모달 열기
  function openSelectedPositionModal() {
    $('.modal-overlay.pop-b').attr('style', 'display: flex');
  }

  // 선택할 수 없습니다 모달 닫기
  function closeSelectedPositionModal() {
    $('.modal-overlay.pop-b').fadeOut(200);
  }

  // 선택할 수 없습니다 버튼 클릭 시 모달 열기
  $(document).on('click', '.modal-button.pop-b', function () {
    closeSelectedPositionModal();
  });

  $(document).on('click', '.send-button', function (e) {
    // 선택 폼이 열려 있으면 SEND 동작 방지
    if ($('.select-form').is(':visible')) {
      e.preventDefault();
      return;
    }

    // pitcher player의 이름 또는 번호가 비어 있으면 선택 폼 열기
    const $pitcher = $('.player.pitcher');
    const name = $pitcher.find('span').eq(1).text().trim();
    const number = $pitcher.find('span').eq(2).text().trim();

    if (!name || !number) {
      e.preventDefault();
      $pitcher.trigger('click');

      // 선택 폼 열리는 걸 기다렸다가 스크롤
      setTimeout(function () {
        $('html, body').animate({ scrollTop: $(document).height() }, 500);
      }, 300);
      return;
    }
  });
});
