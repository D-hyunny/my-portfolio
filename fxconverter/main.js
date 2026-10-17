const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

const form = document.getElementById('converter-form');
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const swapBtn = document.getElementById('swap-btn');
const convertBtn = document.getElementById('convert-btn');
const resultBox = document.getElementById('result');

function showResult(message, isError = false) {
    resultBox.textContent = message;
    resultBox.classList.toggle('error', isError);
}

function formatAmount(value) {
    return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

async function convert() {
    const amount = Number(amountInput.value);
    const from = fromSelect.value;
    const to = toSelect.value;

    if (amountInput.value.trim() === '' || !Number.isFinite(amount) || amount < 0) {
        showResult('올바른 금액을 입력하세요.', true);
        return;
    }

    convertBtn.disabled = true;
    showResult('환율을 불러오는 중...');

    try {
        const response = await fetch(API_URL + from);
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();
        const rate = data.rates[to];
        if (typeof rate !== 'number') {
            throw new Error('환율 정보 없음: ' + to);
        }

        showResult(`${formatAmount(amount)} ${from} = ${formatAmount(amount * rate)} ${to}`);
    } catch (error) {
        console.error(error);
        showResult('환율 정보를 가져오지 못했습니다. 잠시 후 다시 시도하세요.', true);
    } finally {
        convertBtn.disabled = false;
    }
}

swapBtn.addEventListener('click', () => {
    const from = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = from;

    if (amountInput.value.trim() !== '') {
        convert();
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    convert();
});
