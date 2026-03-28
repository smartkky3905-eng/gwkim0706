
const generateBtn = document.getElementById('generate-btn');
const lottoNumbersDiv = document.getElementById('lotto-numbers');

generateBtn.addEventListener('click', () => {
    const numbers = generateLottoNumbers();
    displayNumbers(numbers);
});

function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function displayNumbers(numbers) {
    lottoNumbersDiv.innerHTML = '';
    numbers.forEach(number => {
        const ball = document.createElement('div');
        ball.classList.add('number-ball');
        ball.textContent = number;
        ball.style.backgroundColor = getNumberColor(number);
        lottoNumbersDiv.appendChild(ball);
    });
}

function getNumberColor(number) {
    if (number <= 10) return '#fbc400';
    if (number <= 20) return '#69c8f2';
    if (number <= 30) return '#ff7272';
    if (number <= 40) return '#aaa';
    return '#b0d840';
}
