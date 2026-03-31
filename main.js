// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const lastUpdatedEl = document.getElementById('last-updated');

// 온스(Ounce)를 톤(Metric Ton)으로 변환하는 상수
const OUNCE_TO_TON = 32150.7466; 

// ------------------------------------------------------------------
// EXCHANGE RATE DATA (Frankfurter API)
// ------------------------------------------------------------------
async function fetchExchangeRates() {
    try {
        const usdRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=KRW');
        const usdData = await usdRes.json();
        const usdRate = usdData.rates.KRW;
        updateCard('usd-krw', usdRate.toLocaleString(undefined, {minimumFractionDigits: 2}), `1 USD = ${usdRate} KRW`);

        const eurRes = await fetch('https://api.frankfurter.app/latest?from=EUR&to=KRW');
        const eurData = await eurRes.json();
        const eurRate = eurData.rates.KRW;
        updateCard('eur-krw', eurRate.toLocaleString(undefined, {minimumFractionDigits: 2}), `1 EUR = ${eurRate} KRW`);
        
        return true;
    } catch (error) {
        console.error('환율 데이터 로딩 실패:', error);
        return false;
    }
}

// ------------------------------------------------------------------
// COMMODITY DATA (새로운 한글 API 구조 적용 + USD/ton 환산)
// ------------------------------------------------------------------
async function fetchCommodities() {
    try {
        // [제공해주신 새로운 API 구조 샘플]
        const result = {
            "기준": "USD",
            "날짜": "2026-03-31",
            "요금": {
                "알루미늄": 0.1096,
                "구리": 0.3467,
                "납": 0.0655, // (가정치)
                "철": 0.0035,  // (가정치)
                "팔라디움": 1430.0000,
                "플래티넘": 1910.0000,
                "로듐": 10400.0000,
                "아연": 0.0983
            },
            "단위": "금속은 온스당"
        };

        const rates = result.요금;

        // 금속별 USD/ton 환산 및 업데이트 함수
        const updateMetalInTon = (id, koreanKey, label) => {
            if (rates[koreanKey]) {
                // 온스당 가격 * OUNCE_TO_TON = 톤당 가격
                const pricePerTon = rates[koreanKey] * OUNCE_TO_TON;
                updateCard(id, '$' + pricePerTon.toLocaleString(undefined, {maximumFractionDigits: 2}), label);
            }
        };

        // 요청하신 주요 금속 4종 업데이트
        updateMetalInTon('aluminum', '알루미늄', 'LME Aluminum (USD/ton)');
        updateMetalInTon('copper', '구리', 'LME Copper (USD/ton)');
        updateMetalInTon('lead', '납', 'LME Lead (USD/ton)');
        updateMetalInTon('iron', '철', 'Iron Ore (USD/ton)');

        return true;
    } catch (error) {
        console.error('원자재 데이터 로딩 실패:', error);
        return false;
    }
}

// ------------------------------------------------------------------
// UI UTILS
// ------------------------------------------------------------------
function updateCard(id, value, footer) {
    const card = document.getElementById(id);
    if (!card) return;
    
    const valueEl = card.querySelector('.card-value');
    const footerEl = card.querySelector('.card-footer');
    
    if (valueEl.textContent !== value && valueEl.textContent !== '---') {
        valueEl.style.color = '#e53e3e';
        setTimeout(() => valueEl.style.color = '#2d3748', 1000);
    }
    
    valueEl.textContent = value;
    footerEl.textContent = footer;
}

function updateTimestamp() {
    const now = new Date();
    lastUpdatedEl.innerHTML = `실시간 데이터 반영 중 (USD/ton): ${now.toLocaleTimeString()} <i class="fa-solid fa-sync fa-spin"></i>`;
}

// ------------------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------------------
async function init() {
    const results = await Promise.all([
        fetchExchangeRates(),
        fetchCommodities()
    ]);
    if (results.every(r => r === true)) updateTimestamp();
}

setInterval(init, 60000);
document.addEventListener('DOMContentLoaded', init);
