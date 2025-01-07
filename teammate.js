// 전역 변수
let players = {
    guards: [],
    forwards: [],
    centers: []
};
let selectedPlayer = null;

// 선수 추가 함수
function addPlayers() {
    const positions = ['guards', 'forwards', 'centers'];
    let addedCount = 0;

    positions.forEach(position => {
        const input = document.querySelector(`#${position} input`);
        const playerName = input.value.trim();

        if (playerName) {
            // 중복 체크
            if (players[position].includes(playerName)) {
                alert(`${playerName}은(는) 이미 추가된 선수입니다.`);
                return;
            }
            players[position].push(playerName);
            input.value = '';
            addedCount++;
        }
    });

    if (addedCount > 0) {
        updatePlayerList();
    }
}

// 선수 목록 업데이트 함수
function updatePlayerList() {
    const playerList = document.getElementById('addedPlayers');
    playerList.innerHTML = '';
    const ul = document.createElement('ul');

    const positionNames = {
        'guards': '가드',
        'forwards': '포워드',
        'centers': '센터'
    };

    Object.entries(players).forEach(([position, playerArray]) => {
        playerArray.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player} (${positionNames[position]})`;
            
            const deleteBtn = document.createElement('span');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => {
                players[position] = players[position].filter(p => p !== player);
                updatePlayerList();
            };
            
            li.appendChild(deleteBtn);
            ul.appendChild(li);
        });
    });

    playerList.appendChild(ul);
}

// 선수 클릭 핸들러 수정
function handlePlayerClick(event) {
    const playerElement = event.target.closest('p');
    if (!playerElement) return;

    const team = playerElement.closest('.team');
    if (!team) return;

    // 이전 선택 해제
    document.querySelectorAll('.selected-player-A, .selected-player-B').forEach(el => {
        el.classList.remove('selected-player-A', 'selected-player-B');
    });

    if (selectedPlayer === playerElement) {
        selectedPlayer = null;
    } else {
        const teamType = team.id === 'teamA' ? 'A' : 'B';
        playerElement.classList.add(`selected-player-${teamType}`);
        selectedPlayer = playerElement;
    }

    // 버든 버튼 상태 업데이트
    updateMoveButtons(team.id);
    updateMoveButton();
    updateShuffleButtons();
}

// 팀 나누기 함수
function divideTeams() {
    // 전체 선수 수 확인
    const totalPlayers = players.guards.length + players.forwards.length + players.centers.length;
    
    if (totalPlayers === 0) {
        alert('나눌 선수가 없습니다.');
        return;
    }

    // 인원수 차이 체크
    const teamASize = Math.ceil(totalPlayers / 2);
    const teamBSize = totalPlayers - teamASize;
    
    if (Math.abs(teamASize - teamBSize) > 1) {
        alert('팀 간의 인원수 차이가 2명 이상이 되지 않도록 선수를 추가해주세요.');
        return;
    }

    // 각 포지션별 선수를 섞기
    const shuffledGuards = shuffle([...players.guards]);
    const shuffledForwards = shuffle([...players.forwards]);
    const shuffledCenters = shuffle([...players.centers]);
    
    // A팀과 B팀 초기화
    let teamA = [];
    let teamB = [];
    
    // 포지션별로 팀 나누기
    function divideByPosition(players) {
        const shuffledPlayers = shuffle([...players]);
        shuffledPlayers.forEach((player, index) => {
            if (index % 2 === 0) {
                if (teamA.length < teamASize) {
                    teamA.push(player);
                } else {
                    teamB.push(player);
                }
            } else {
                if (teamB.length < teamBSize) {
                    teamB.push(player);
                } else {
                    teamA.push(player);
                }
            }
        });
    }

    // 각 포지션별로 나누기
    divideByPosition(shuffledGuards);
    divideByPosition(shuffledForwards);
    divideByPosition(shuffledCenters);

    // 각 팀의 선수 순서 다시 섞기
    teamA = shuffle(teamA);
    teamB = shuffle(teamB);

    // HTML 구조 재생성
    const teamAElement = document.getElementById('teamA');
    const teamBElement = document.getElementById('teamB');

    // A팀 HTML 구조 생성
    teamAElement.innerHTML = `
        <div class="team-header">
            <h4>A팀 (${teamA.length}명)</h4>
            <div class="position-counts">
                <span class="position-count guards">가드: ${teamA.filter(p => players.guards.includes(p)).length}명</span>
                <span class="position-count forwards">포워드: ${teamA.filter(p => players.forwards.includes(p)).length}명</span>
                <span class="position-count centers">센터: ${teamA.filter(p => players.centers.includes(p)).length}명</span>
            </div>
        </div>
        <div class="team-content">
            <div class="team-controls">
                <button type="button" class="move-up-btn" onclick="movePlayerPosition('up', 'teamA')" disabled>▲</button>
                <button type="button" class="move-down-btn" onclick="movePlayerPosition('down', 'teamA')" disabled>▼</button>
            </div>
            <div class="players-list">
                ${teamA.map((player, index) => {
                    let position = '';
                    if (players.guards.includes(player)) position = '(가드)';
                    else if (players.forwards.includes(player)) position = '(포워드)';
                    else if (players.centers.includes(player)) position = '(센터)';
                    return `<p><span class="player-number">${index + 1}</span>${player} ${position}</p>`;
                }).join('')}
            </div>
        </div>
    `;

    // B팀 HTML 구조 생성
    teamBElement.innerHTML = `
        <div class="team-header">
            <h4>B팀 (${teamB.length}명)</h4>
            <div class="position-counts">
                <span class="position-count guards">가드: ${teamB.filter(p => players.guards.includes(p)).length}명</span>
                <span class="position-count forwards">포워드: ${teamB.filter(p => players.forwards.includes(p)).length}명</span>
                <span class="position-count centers">센터: ${teamB.filter(p => players.centers.includes(p)).length}명</span>
            </div>
        </div>
        <div class="team-content">
            <div class="team-controls">
                <button type="button" class="move-up-btn" onclick="movePlayerPosition('up', 'teamB')" disabled>▲</button>
                <button type="button" class="move-down-btn" onclick="movePlayerPosition('down', 'teamB')" disabled>▼</button>
            </div>
            <div class="players-list">
                ${teamB.map((player, index) => {
                    let position = '';
                    if (players.guards.includes(player)) position = '(가드)';
                    else if (players.forwards.includes(player)) position = '(포워드)';
                    else if (players.centers.includes(player)) position = '(센터)';
                    return `<p><span class="player-number">${index + 1}</span>${player} ${position}</p>`;
                }).join('')}
            </div>
        </div>
    `;

    // 선수 클릭 이벤트 다시 추가
    document.querySelectorAll('#teamA p, #teamB p').forEach(player => {
        player.addEventListener('click', handlePlayerClick);
        player.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePlayerClick(e);
        });
    });

    // 선택 상태 초기화
    selectedPlayer = null;
    updateMoveButton();
    updateShuffleButtons();
}

// 팀 표시 함수
function displayTeam(teamName, teamPlayers) {
    const team = document.getElementById(`team${teamName}`);
    const guards = teamPlayers.filter(p => players.guards.includes(p));
    const forwards = teamPlayers.filter(p => players.forwards.includes(p));
    const centers = teamPlayers.filter(p => players.centers.includes(p));

    team.innerHTML = `
        <h4>${teamName}팀 (${teamPlayers.length}명)</h4>
        <div class="position-counts">
            <span class="position-count guards">가드: ${guards.length}명</span>
            <span class="position-count forwards">포워드: ${forwards.length}명</span>
            <span class="position-count centers">센터: ${centers.length}명</span>
        </div>
        ${teamPlayers.map(player => {
            let position = '';
            if (players.guards.includes(player)) position = '(가드)';
            else if (players.forwards.includes(player)) position = '(포워드)';
            else if (players.centers.includes(player)) position = '(센터)';
            return `<p>${player} ${position}</p>`;
        }).join('')}
    `;

    // 선수들에게 클릭 이벤트 추가
    const newPlayers = team.querySelectorAll('p');
    newPlayers.forEach(player => {
        player.addEventListener('click', handlePlayerClick);
        player.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePlayerClick(e);
        });
    });
}

// 배열 섞기 함수
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 포지션 체운트 체크 함수 수정
function checkPositionCounts(teamId) {
    const team = document.getElementById(teamId);
    if (!team) return null;

    const playerElements = team.querySelectorAll('.players-list p');
    const counts = {
        guards: 0,
        forwards: 0,
        centers: 0
    };

    playerElements.forEach(player => {
        const playerText = player.textContent;
        if (playerText.includes('(가드)')) counts.guards++;
        else if (playerText.includes('(포워드)')) counts.forwards++;
        else if (playerText.includes('(센터)')) counts.centers++;
    });

    return counts;
}

// 팀 이동 함수 수정
function movePlayer() {
    if (!selectedPlayer) {
        alert('이동할 선수를 선택해주세요.');
        return;
    }

    const currentTeam = selectedPlayer.closest('.team');
    const targetTeamId = currentTeam.id === 'teamA' ? 'teamB' : 'teamA';
    const targetTeam = document.getElementById(targetTeamId);
    const targetPlayersList = targetTeam.querySelector('.players-list');

    // 선수 이동
    const playerClone = selectedPlayer.cloneNode(true);
    targetPlayersList.appendChild(playerClone);
    selectedPlayer.remove();

    // 선수 번호 업데이트
    updatePlayerNumbers(currentTeam.id);
    updatePlayerNumbers(targetTeamId);

    // 이벤트 리스너 다시 추가
    playerClone.addEventListener('click', handlePlayerClick);
    playerClone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePlayerClick(e);
    });

    // 양쪽 팀 정보 업데이트
    updateTeamInfo(currentTeam.id);
    updateTeamInfo(targetTeamId);

    // 선택 상태 초기화
    selectedPlayer = null;
    updateMoveButton();
    updateShuffleButtons();
}

// 팀 정보 업데이트 함수 수정
function updateTeamInfo(teamId) {
    const team = document.getElementById(teamId);
    if (!team) return;

    const playersList = team.querySelector('.players-list');
    if (!playersList) return;

    const players = Array.from(playersList.querySelectorAll('p'));
    const counts = {
        guards: players.filter(p => p.textContent.includes('(가드)')).length,
        forwards: players.filter(p => p.textContent.includes('(포워드)')).length,
        centers: players.filter(p => p.textContent.includes('(센터)')).length
    };

    // 팀 제목과 포지션 카운트 업데이트
    team.querySelector('h4').textContent = `${teamId === 'teamA' ? 'A' : 'B'}팀 (${players.length}명)`;
    team.querySelector('.position-counts').innerHTML = `
        <span class="position-count guards">가드: ${counts.guards}명</span>
        <span class="position-count forwards">포워드: ${counts.forwards}명</span>
        <span class="position-count centers">센터: ${counts.centers}명</span>
    `;
}

// JavaScript에 초기화 함수 추가
function resetPlayerList() {
    // 확인 메시지
    const confirmReset = confirm('정말로 모든 선수 목록을 초기화하시겠습니까?');
    if (!confirmReset) return;

    // 전역 변수 초기화
    players = {
        guards: [],
        forwards: [],
        centers: []
    };

    // 선수 목록 UI 초기화
    const playerList = document.getElementById('addedPlayers');
    playerList.querySelector('ul').innerHTML = '';

    // 팀 초기화
    ['A', 'B'].forEach(team => {
        const teamElement = document.getElementById(`team${team}`);
        teamElement.innerHTML = `
            <h4>${team}팀 (0명)</h4>
            <div class="position-counts">
                <span class="position-count guards">가드: 0명</span>
                <span class="position-count forwards">포워드: 0명</span>
                <span class="position-count centers">센터: 0명</span>
            </div>
        `;
    });

    // 선택된 선수 초기화
    selectedPlayer = null;
}

// 이동 버튼 텍스트 업데이트 함수
function updateMoveButton() {
    const moveBtn = document.getElementById('moveTeam');
    if (!selectedPlayer) {
        moveBtn.textContent = '팀 이동';
        moveBtn.disabled = true;
    } else {
        const currentTeam = selectedPlayer.closest('.team').id;
        const targetTeam = currentTeam === 'teamA' ? 'B' : 'A';
        moveBtn.textContent = `${targetTeam}팀으로 이동`;
        moveBtn.disabled = false;
    }
}

// 특정 팀 선수 섞기 함수
function shuffleTeam(teamId) {
    const teamElement = document.getElementById(teamId);
    if (!teamElement) return;

    const playersList = teamElement.querySelector('.players-list');
    if (!playersList) return;

    const players = Array.from(playersList.querySelectorAll('p'));
    
    if (players.length === 0) {
        alert(`섞을 선수가 없습니다.`);
        return;
    }

    // 선수들을 섞기
    const shuffledPlayers = shuffle([...players]);
    
    // 기존 선수 목록 비우기
    while (playersList.firstChild) {
        playersList.removeChild(playersList.firstChild);
    }

    // 섞인 선수들 다시 추가
    shuffledPlayers.forEach((player, index) => {
        const newPlayer = player.cloneNode(true);
        // 선수 번호 업데이트
        const numberSpan = newPlayer.querySelector('.player-number');
        if (numberSpan) {
            numberSpan.textContent = index + 1;
        }
        // 이벤트 리스너 다시 추가
        newPlayer.addEventListener('click', handlePlayerClick);
        newPlayer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePlayerClick(e);
        });
        playersList.appendChild(newPlayer);
    });

    // 선택 상태 초기화
    selectedPlayer = null;
    
    // 버튼 상태 업데이트
    updateMoveButtons(teamId);
    updateMoveButton();
    updateShuffleButtons();
    updateTeamInfo(teamId);
}

// 버튼 상태 업데이트 함수를 전역으로 이동
function updateShuffleButtons() {
    const teamAPlayers = document.querySelectorAll('#teamA p').length;
    const teamBPlayers = document.querySelectorAll('#teamB p').length;
    
    const shuffleTeamABtn = document.getElementById('shuffleTeamA');
    const shuffleTeamBBtn = document.getElementById('shuffleTeamB');
    
    if (shuffleTeamABtn) shuffleTeamABtn.disabled = teamAPlayers < 2;
    if (shuffleTeamBBtn) shuffleTeamBBtn.disabled = teamBPlayers < 2;
}

// 위/아래 이동 버튼 상태 업데이트 함수 수정
function updateMoveButtons(teamId) {
    const teamElement = document.getElementById(teamId);
    if (!teamElement) return;

    const upButton = teamElement.querySelector('.move-up-btn');
    const downButton = teamElement.querySelector('.move-down-btn');
    if (!upButton || !downButton) return;

    const selectedPlayer = teamElement.querySelector('.selected-player-A, .selected-player-B');
    if (!selectedPlayer) {
        upButton.disabled = true;
        downButton.disabled = true;
        return;
    }

    const playersList = teamElement.querySelector('.players-list');
    const players = Array.from(playersList.querySelectorAll('p'));
    const playerIndex = players.indexOf(selectedPlayer);

    upButton.disabled = playerIndex <= 0;
    downButton.disabled = playerIndex >= players.length - 1;
}

// movePlayerPosition 함수를 전역 스코프로 이동
window.movePlayerPosition = function(direction, teamId) {
    const teamElement = document.getElementById(teamId);
    if (!teamElement) return;

    const playersList = teamElement.querySelector('.players-list');
    if (!playersList) return;

    const selectedPlayer = teamElement.querySelector('.selected-player-A, .selected-player-B');
    if (!selectedPlayer) return;

    const players = Array.from(playersList.querySelectorAll('p'));
    const currentIndex = players.indexOf(selectedPlayer);
    
    if (direction === 'up' && currentIndex > 0) {
        playersList.insertBefore(selectedPlayer, players[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < players.length - 1) {
        playersList.insertBefore(players[currentIndex + 1], selectedPlayer);
    }

    updatePlayerNumbers(teamId);
    updateMoveButtons(teamId);
    updateTeamInfo(teamId); // 팀 정보 업데이트 추가
}

// 선수 위치 이동 후 번호 업데이트 함수 추가
function updatePlayerNumbers(teamId) {
    const teamElement = document.getElementById(teamId);
    const players = teamElement.querySelectorAll('.players-list p');
    players.forEach((player, index) => {
        const numberSpan = player.querySelector('.player-number');
        if (numberSpan) {
            numberSpan.textContent = index + 1;
        }
    });
}

// DOMContentLoaded 이벤트 리스너 수정
document.addEventListener('DOMContentLoaded', function() {
    // 선수 추가 버튼 이벤트 리스너
    document.getElementById('addPlayerBtn').addEventListener('click', addPlayers);

    // 이동 버튼 이벤트 리스너
    document.getElementById('moveTeam').addEventListener('click', movePlayer);
    
    // 초기 버튼 상태 설정
    updateMoveButton();

    // 팀 나누기 버튼 이벤트 리스너 (ID로 변경)
    const divideBtn = document.getElementById('divideBtn');
    if (divideBtn) {  // 버튼이 존재할 때만 이벤트 리스너 추가
        divideBtn.addEventListener('click', divideTeams);
    }

    // 엔터키로 선수 추가
    ['guards', 'forwards', 'centers'].forEach(position => {
        const input = document.querySelector(`#${position} input`);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addPlayers();
            }
        });
    });

    // 초기화 버튼 이벤트 리스너
    document.getElementById('resetBtn').addEventListener('click', resetPlayerList);

    // A팀 섞기 버튼 이벤트 리스너
    document.getElementById('shuffleTeamA').addEventListener('click', function() {
        const confirmShuffle = confirm('A팀의 선수 순서를 섞으시겠습니까?');
        if (confirmShuffle) {
            shuffleTeam('teamA');
        }
    });

    // B팀 섞기 버튼 이벤트 리스너
    document.getElementById('shuffleTeamB').addEventListener('click', function() {
        const confirmShuffle = confirm('B팀의 선수 순서를 섞으시겠습니까?');
        if (confirmShuffle) {
            shuffleTeam('teamB');
        }
    });

    // 초기 버튼 상태 설정
    updateShuffleButtons();
    updateMoveButton();

    // movePlayer 함수에 버튼 상태 업데이트 추가
    const originalMovePlayer = movePlayer;
    movePlayer = function() {
        originalMovePlayer.apply(this, arguments);
        updateShuffleButtons();
    };

    // 위/아래 이동 버튼 이벤트 리스너 다시 설정
    function setupMoveButtons() {
        ['teamA', 'teamB'].forEach(teamId => {
            const team = document.getElementById(teamId);
            if (!team) return;

            const upBtn = team.querySelector('.move-up-btn');
            const downBtn = team.querySelector('.move-down-btn');

            if (upBtn) {
                upBtn.addEventListener('click', () => movePlayerPosition('up', teamId));
            }
            if (downBtn) {
                downBtn.addEventListener('click', () => movePlayerPosition('down', teamId));
            }
        });
    }

    // 초기 버튼 설정
    setupMoveButtons();

    // divideTeams 함수 실행 후에도 버튼 이벤트 다시 설정
    const originalDivideTeams = divideTeams;
    divideTeams = function() {
        originalDivideTeams.apply(this, arguments);
        setupMoveButtons();
    };
});