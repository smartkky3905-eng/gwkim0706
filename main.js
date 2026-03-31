// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const lastUpdatedEl = document.getElementById('last-updated');

// 온스(Ounce)를 톤(Metric Ton)으로 변환하는 상수 (1 t = 32,150.7466 oz)
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
// COMMODITY DATA (온스 & 톤 가격 동시 표기)
// ------------------------------------------------------------------
async function fetchCommodities() {
    try {
        // [제공해주신 새로운 API 구조 샘플]
        const result = {
            "기준": "USD",
            "요금": {
                "알루미늄": 0.1096,
                "구리": 0.3467,
                "납": 0.0655,
                "철": 0.0035,
                "아연": 0.0983
            }
        };

        const rates = result.요금;

        // 금속별 온스($/oz) 및 톤($/ton) 가격 업데이트 함수
        const updateMetalPrices = (id, koreanKey, label) => {
            if (rates[koreanKey]) {
                const pricePerOz = rates[koreanKey];
                const pricePerTon = pricePerOz * OUNCE_TO_TON;
                
                // 메인 값: $/ton, 하단 정보: $/oz 포함
                updateCard(
                    id, 
                    '$' + pricePerTon.toLocaleString(undefined, {maximumFractionDigits: 2}), 
                    `${label} | $${pricePerOz.toFixed(4)}/oz`
                );
            }
        };

        updateMetalPrices('aluminum', '알루미늄', 'Aluminum');
        updateMetalPrices('copper', '구리', 'Copper');
        updateMetalPrices('lead', '납', 'Lead');
        updateMetalPrices('iron', '철', 'Iron Ore');

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
    footerEl.innerHTML = footer; // HTML 태그 사용 가능하도록 수정
}

function updateTimestamp() {
    const now = new Date();
    lastUpdatedEl.innerHTML = `실시간 데이터 반영 중: ${now.toLocaleTimeString()} <i class="fa-solid fa-sync fa-spin"></i>`;
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
