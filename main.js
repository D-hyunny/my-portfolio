const projects = [
    {
        title: 'Todo App',
        icon: '✅',
        description: '할 일을 추가하고 완료 표시하며 관리하는 할 일 목록 앱입니다.',
        tags: ['HTML', 'CSS', 'JavaScript', 'LocalStorage'],
        url: 'My-ToDo-App/index.html',
        accent: '#667eea',
    },
    {
        title: '환율 변환기',
        icon: '💱',
        description: '금액과 통화를 선택하면 원하는 통화로 바로 환산해 줍니다.',
        tags: ['HTML', 'CSS', 'JavaScript', 'Fetch API'],
        url: 'fxconverter/index.html',
        accent: '#38bdf8',
    },
    {
        title: '스네이크 게임',
        icon: '🐍',
        description: '방향키로 뱀을 움직여 먹이를 먹고 점수를 올리는 고전 게임입니다.',
        tags: ['HTML', 'Canvas', 'JavaScript'],
        url: 'snake/index.html',
        accent: '#4ade80',
    },
];

function createCard(project) {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = project.url;
    card.style.setProperty('--accent', project.accent);

    card.innerHTML = `
        <div class="card-icon" aria-hidden="true">${project.icon}</div>
        <h2>${project.title}</h2>
        <p>${project.description}</p>
        <ul class="tags">
            ${project.tags.map((tag) => `<li>${tag}</li>`).join('')}
        </ul>
        <span class="card-link">프로젝트 보기</span>
    `;
    return card;
}

function initApp() {
    const grid = document.getElementById('projectGrid');
    projects.forEach((project) => grid.appendChild(createCard(project)));
    document.getElementById('year').textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', initApp);
