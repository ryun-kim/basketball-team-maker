// 전역 변수
let players = {
    guards: [],
    forwards: [],
    centers: []
};
let selectedPlayer = null;
let isThreeTeamMode = false;

// 선수 추가 함수
function addPlayers() {
    const positions = ['guards', 'forwards', 'centers'];
    let addedCount = 0;

    positions.forEach(position => {
        const input = document.querySelector(`#${position} input`);
        if (!input) return; // 입력 필드가 없으면 건너뛰기

        const playerName = input.value.trim();

        if (playerName) {
            // 중복 체크
            if (players[position].includes(playerName)) {
                alert(`${playerName}은(는) 이미 추가된 선수입니다.`);
                return;
            }
            
            // 선수 추가
            players[position].push(playerName);
            input.value = ''; // 입력 필드 초기화
            addedCount++;
        }
    });

    if (addedCount > 0) {
        updatePlayerList();
        //console.log('선수가 추가되었습니다:', players); // 디버깅용
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
    document.querySelectorAll('.selected-player-A, .selected-player-B, .selected-player-C').forEach(el => {
        el.classList.remove('selected-player-A', 'selected-player-B', 'selected-player-C');
    });

    if (selectedPlayer === playerElement) {
        selectedPlayer = null;
    } else {
        const teamType = team.id.replace('team', '');
        playerElement.classList.add(`selected-player-${teamType}`);
        selectedPlayer = playerElement;
    }

    // 버튼 상태 업데이트
    updateMoveButtons(team.id);
    updateMoveButton();
    updateShuffleButtons();
}

// 팀 모드 전환 함수 수정
function toggleTeamMode() {
    isThreeTeamMode = !isThreeTeamMode;
    const teamC = document.getElementById('teamC');
    const moveButtons2 = document.getElementById('moveButtons2');
    const shuffleTeamC = document.getElementById('shuffleTeamC');
    const toggleBtn = document.getElementById('toggleTeamMode');
    
    if (isThreeTeamMode) {
        // 3팀 모드로 전환
        teamC.style.display = 'block';
        moveButtons2.style.display = 'flex';
        shuffleTeamC.style.display = 'inline-block';
        toggleBtn.textContent = '2파전';
        // 3팀으로 자동 나누기
        const totalPlayers = players.guards.length + players.forwards.length + players.centers.length;
        if (totalPlayers > 0) {
            divideThreeTeams();
        }
    } else {
        // 2팀 모드로 전환
        teamC.style.display = 'none';
        moveButtons2.style.display = 'none';
        shuffleTeamC.style.display = 'none';
        toggleBtn.textContent = '3파전';
        // 2팀으로 자동 나누기
        const totalPlayers = players.guards.length + players.forwards.length + players.centers.length;
        if (totalPlayers > 0) {
            divideTwoTeams();
        }
    }

    // 선택된 선수 초기화
    selectedPlayer = null;
    updateMoveButton();
    updateShuffleButtons();
}

// 팀 나누기 함수 수정
function divideTeams() {
    // 전체 선수 수 확인
    const totalPlayers = players.guards.length + players.forwards.length + players.centers.length;
    
    if (totalPlayers === 0) {
        alert('나눌 선수가 없습니다.');
        return;
    }

    if (isThreeTeamMode) {
        divideThreeTeams();
    } else {
        divideTwoTeams();
    }
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
    const currentTeamId = currentTeam.id;
    const clickedButton = event.target;
    let targetTeamId;

    // 클릭된 버튼에 따라 목적지 팀 결정
    if (clickedButton.textContent.includes('A팀으로')) {
        targetTeamId = 'teamA';
    } else if (clickedButton.textContent.includes('B팀으로')) {
        targetTeamId = 'teamB';
    } else if (clickedButton.textContent.includes('C팀으로')) {
        targetTeamId = 'teamC';
    }

    const targetTeam = document.getElementById(targetTeamId);
    const targetPlayersList = targetTeam.querySelector('.players-list');

    // 선수 이동
    const playerClone = selectedPlayer.cloneNode(true);
    targetPlayersList.appendChild(playerClone);
    selectedPlayer.remove();

    // 선수 번호 업데이트
    updatePlayerNumbers(currentTeamId);
    updatePlayerNumbers(targetTeamId);

    // 이벤트 리스너 다시 추가
    playerClone.addEventListener('click', handlePlayerClick);
    playerClone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handlePlayerClick(e);
    });

    // 양쪽 팀 정보 업데이트
    updateTeamInfo(currentTeamId);
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
    team.querySelector('h4').textContent = `${teamId === 'teamA' ? 'A' : teamId === 'teamB' ? 'B' : 'C'}팀 (${players.length}명)`;
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
    ['A', 'B', 'C'].forEach(team => {
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
    const moveBtn2 = document.getElementById('moveTeam2');
    if (!moveBtn || !moveBtn2) return;

    if (!selectedPlayer) {
        moveBtn.textContent = '팀 이동';
        moveBtn.disabled = true;
        moveBtn2.textContent = '팀 이동';
        moveBtn2.disabled = true;
    } else {
        const currentTeam = selectedPlayer.closest('.team').id;
        if (currentTeam === 'teamA') {
            moveBtn.textContent = 'B팀으로 이동';
            moveBtn.disabled = false;
            moveBtn2.textContent = 'C팀으로 이동';
            moveBtn2.disabled = false;
        } else if (currentTeam === 'teamB') {
            moveBtn.textContent = 'A팀으로 이동';
            moveBtn.disabled = false;
            moveBtn2.textContent = 'C팀으로 이동';
            moveBtn2.disabled = false;
        } else if (currentTeam === 'teamC') {
            moveBtn.textContent = 'A팀으로 이동';
            moveBtn.disabled = false;
            moveBtn2.textContent = 'B팀으로 이동';
            moveBtn2.disabled = false;
        }
    }
}

// 특정 팀 선수 섞기 함수 수정
function shuffleTeam(teamId) {
    const teamElement = document.getElementById(teamId);
    if (!teamElement) return;

    const playersList = teamElement.querySelector('.players-list');
    if (!playersList) return;

    const players = Array.from(playersList.querySelectorAll('p'));
    
    if (players.length === 0) {
        alert(`${teamId.replace('team', '')}팀에 섞을 선수가 없습니다.`);
        return;
    }

    // 선수들을 섞기
    const shuffledPlayers = shuffle([...players]);
    
    // 기존 선수 목록 비우기
    playersList.innerHTML = '';

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
    const teamCPlayers = document.querySelectorAll('#teamC p').length;
    
    const shuffleTeamABtn = document.getElementById('shuffleTeamA');
    const shuffleTeamBBtn = document.getElementById('shuffleTeamB');
    const shuffleTeamCBtn = document.getElementById('shuffleTeamC');
    
    if (shuffleTeamABtn) shuffleTeamABtn.disabled = teamAPlayers < 2;
    if (shuffleTeamBBtn) shuffleTeamBBtn.disabled = teamBPlayers < 2;
    if (shuffleTeamCBtn) shuffleTeamCBtn.disabled = teamCPlayers < 2;
}

// 위/아래 이동 버튼 상태 업데이트 함수 수정
function updateMoveButtons(teamId) {
    const teamElement = document.getElementById(teamId);
    if (!teamElement) return;

    const upButton = teamElement.querySelector('.move-up-btn');
    const downButton = teamElement.querySelector('.move-down-btn');
    if (!upButton || !downButton) return;

    const selectedPlayer = teamElement.querySelector('.selected-player-A, .selected-player-B, .selected-player-C');
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

    const selectedPlayer = teamElement.querySelector('.selected-player-A, .selected-player-B, .selected-player-C');
    if (!selectedPlayer) return;

    const allPlayers = Array.from(playersList.querySelectorAll('p'));
    const currentIndex = allPlayers.indexOf(selectedPlayer);

    if (direction === 'up' && currentIndex > 0) {
        playersList.insertBefore(selectedPlayer, allPlayers[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < allPlayers.length - 1) {
        const targetPosition = allPlayers[currentIndex + 1].nextElementSibling;
        playersList.insertBefore(selectedPlayer, targetPosition);
    }

    // 번호 업데이트
    Array.from(playersList.querySelectorAll('p')).forEach((player, index) => {
        const numberSpan = player.querySelector('.player-number');
        if (numberSpan) {
            numberSpan.textContent = index + 1;
        }
    });

    // 버튼 상태 업데이트
    updateMoveButtons(teamId);
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

// 2팀으로 나누기 함수
function divideTwoTeams() {
    // C팀 숨기기
    document.getElementById('teamC').style.display = 'none';
    document.getElementById('moveButtons2').style.display = 'none';
    
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

    // HTML 구조 업데이트
    updateTeamDisplay('teamA', teamA);
    updateTeamDisplay('teamB', teamB);
}

// 3팀으로 나누기 함수
function divideThreeTeams() {
    // C팀과 이동 버튼 표시
    document.getElementById('teamC').style.display = 'block';
    document.getElementById('moveButtons2').style.display = 'flex';
    
    // 전체 선수 수 확인
    const totalPlayers = players.guards.length + players.forwards.length + players.centers.length;
    
    if (totalPlayers === 0) {
        alert('나눌 선수가 없습니다.');
        return;
    }

    // 각 팀의 인원수 계산
    const baseSize = Math.floor(totalPlayers / 3);
    const remainder = totalPlayers % 3;
    
    const teamSizes = [
        baseSize + (remainder > 0 ? 1 : 0),
        baseSize + (remainder > 1 ? 1 : 0),
        baseSize
    ];

    // 각 포지션별 선수를 섞기
    const shuffledGuards = shuffle([...players.guards]);
    const shuffledForwards = shuffle([...players.forwards]);
    const shuffledCenters = shuffle([...players.centers]);
    
    // 팀 초기화
    let teamA = [];
    let teamB = [];
    let teamC = [];
    
    // 포지션별로 팀 나누기
    function divideByPosition(players) {
        const shuffledPlayers = shuffle([...players]);
        shuffledPlayers.forEach((player, index) => {
            const teamIndex = index % 3;
            if (teamIndex === 0 && teamA.length < teamSizes[0]) {
                teamA.push(player);
            } else if (teamIndex === 1 && teamB.length < teamSizes[1]) {
                teamB.push(player);
            } else if (teamIndex === 2 && teamC.length < teamSizes[2]) {
                teamC.push(player);
            } else {
                // 남은 자리가 있는 팀에 배정
                if (teamA.length < teamSizes[0]) teamA.push(player);
                else if (teamB.length < teamSizes[1]) teamB.push(player);
                else if (teamC.length < teamSizes[2]) teamC.push(player);
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
    teamC = shuffle(teamC);

    // HTML 구조 업데이트
    updateTeamDisplay('teamA', teamA);
    updateTeamDisplay('teamB', teamB);
    updateTeamDisplay('teamC', teamC);
}

// 팀 표시 업데이트 함수
function updateTeamDisplay(teamId, teamPlayers) {
    const teamElement = document.getElementById(teamId);
    const positionCounts = {
        guards: teamPlayers.filter(p => players.guards.includes(p)).length,
        forwards: teamPlayers.filter(p => players.forwards.includes(p)).length,
        centers: teamPlayers.filter(p => players.centers.includes(p)).length
    };

    teamElement.innerHTML = `
        <div class="team-header">
            <h4>${teamId.replace('team', '')}팀 (${teamPlayers.length}명)</h4>
            <div class="position-counts">
                <span class="position-count guards">가드: ${positionCounts.guards}명</span>
                <span class="position-count forwards">포워드: ${positionCounts.forwards}명</span>
                <span class="position-count centers">센터: ${positionCounts.centers}명</span>
            </div>
        </div>
        <div class="team-content">
            <div class="team-controls">
                <button class="move-up-btn" onclick="movePlayerPosition('up', '${teamId}')" disabled>▲</button>
                <button class="move-down-btn" onclick="movePlayerPosition('down', '${teamId}')" disabled>▼</button>
            </div>
            <div class="players-list">
                ${teamPlayers.map((player, index) => {
                    let position = '';
                    if (players.guards.includes(player)) position = '(가드)';
                    else if (players.forwards.includes(player)) position = '(포워드)';
                    else if (players.centers.includes(player)) position = '(센터)';
                    return `<p><span class="player-number">${index + 1}</span>${player} ${position}</p>`;
                }).join('')}
            </div>
        </div>
    `;

    // 선수들에게 클릭 이벤트 추가
    const newPlayers = teamElement.querySelectorAll('.players-list p');
    newPlayers.forEach(player => {
        player.addEventListener('click', handlePlayerClick);
        player.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePlayerClick(e);
        });
    });
}

// DOMContentLoaded 이벤트 리스너 수정
document.addEventListener('DOMContentLoaded', function() {
    // 모든 버튼 이벤트 리스너를 안전하게 추가
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener('click', addPlayers);
    }

    const moveTeamBtn = document.getElementById('moveTeam');
    if (moveTeamBtn) {
        moveTeamBtn.addEventListener('click', movePlayer);
        updateMoveButton();
    }

    const divideBtn = document.getElementById('divideBtn');
    if (divideBtn) {
        divideBtn.addEventListener('click', divideTeams);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPlayerList);
    }

    const toggleTeamModeBtn = document.getElementById('toggleTeamMode');
    if (toggleTeamModeBtn) {
        toggleTeamModeBtn.addEventListener('click', toggleTeamMode);
    }

    const shuffleTeamABtn = document.getElementById('shuffleTeamA');
    if (shuffleTeamABtn) {
        shuffleTeamABtn.addEventListener('click', function() {
            const confirmShuffle = confirm('A팀의 선수 순서를 섞으시겠습니까?');
            if (confirmShuffle) {
                shuffleTeam('teamA');
            }
        });
    }

    const shuffleTeamBBtn = document.getElementById('shuffleTeamB');
    if (shuffleTeamBBtn) {
        shuffleTeamBBtn.addEventListener('click', function() {
            const confirmShuffle = confirm('B팀의 선수 순서를 섞으시겠습니까?');
            if (confirmShuffle) {
                shuffleTeam('teamB');
            }
        });
    }

    const shuffleTeamCBtn = document.getElementById('shuffleTeamC');
    if (shuffleTeamCBtn) {
        shuffleTeamCBtn.addEventListener('click', function() {
            const confirmShuffle = confirm('C팀의 선수 순서를 섞으시겠습니까?');
            if (confirmShuffle) {
                shuffleTeam('teamC');
            }
        });
    }

    const moveTeam2Btn = document.getElementById('moveTeam2');
    if (moveTeam2Btn) {
        moveTeam2Btn.addEventListener('click', movePlayer);
    }

    // 입력 필드에 엔터키 이벤트 리스너 추가
    ['guards', 'forwards', 'centers'].forEach(position => {
        const input = document.querySelector(`#${position} input`);
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addPlayers();
                }
            });
        }
    });

    // 초기 상태 설정
    updateShuffleButtons();
    updateMoveButton();
});

// divideTeams 함수에서 setupMoveButtons 호출 제거
const originalDivideTeams = divideTeams;
divideTeams = function() {
    originalDivideTeams.apply(this, arguments);
};