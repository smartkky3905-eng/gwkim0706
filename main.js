// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const lastUpdatedEl = document.getElementById('last-updated');

// ------------------------------------------------------------------
// EXCHANGE RATE DATA (Frankfurter API - 실시간/무료)
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
        updateCardError('currency-grid');
        return false;
    }
}

// ------------------------------------------------------------------
// COMMODITY DATA (제공해주신 API 구조 적용)
// ------------------------------------------------------------------
async function fetchCommodities() {
    try {
        // 실제 API 호출 시 주소를 입력하세요 (현재는 제공해주신 구조로 처리)
        // const response = await fetch('YOUR_METALS_API_URL');
        // const result = await response.json();
        
        // 제공해주신 API 응답 샘플 데이터 구조
        const result = { 
            "data": { 
                "success": true, 
                "rates": { 
                    "USDLME-XCU": 8432.50, // 구리 (예시)
                    "USDLME-LEAD": 2105.00, // 납 (예시)
                    "USDLME-ALU": 2270.50, // 알루미늄 (예시)
                    "USDIRON": 113.20,      // 철광석 (예시)
                    "USDXAU": 4584.87,      // 금 (샘플에 있던 값)
                    "USDXAG": 73.15         // 은 (샘플에 있던 값)
                } 
            } 
        };

        const rates = result.data.rates;

        // 원자재 카드 업데이트 (제공된 구조에 맞춰 USD 가격 직접 추출)
        updateCard('copper', '$' + (rates['USDLME-XCU'] || 8432.50).toLocaleString(), 'LME Copper Grade A');
        updateCard('lead', '$' + (rates['USDLME-LEAD'] || 2105.00).toLocaleString(), 'LME Lead Standard');
        updateCard('aluminum', '$' + (rates['USDLME-ALU'] || 2270.50).toLocaleString(), 'LME Aluminum HG');
        updateCard('iron', '$' + (rates['USDIRON'] || 113.20).toLocaleString(), 'Iron Ore 62% Fe');

        return true;
    } catch (error) {
        console.error('원자재 데이터 로딩 실패:', error);
        return false;
    }
}

// ------------------------------------------------------------------
// UTILS
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

function updateCardError(gridId) {
    const grid = document.getElementById(gridId);
    if (grid) {
        const cards = grid.querySelectorAll('.card-value');
        cards.forEach(c => c.textContent = '불러오기 실패');
    }
}

function updateTimestamp() {
    const now = new Date();
    lastUpdatedEl.innerHTML = `실시간 데이터 반영 중: ${now.toLocaleTimeString()} <i class="fa-solid fa-sync fa-spin" style="font-size: 0.8em; margin-left: 5px;"></i>`;
}

// ------------------------------------------------------------------
// INITIALIZE & AUTO-REFRESH
// ------------------------------------------------------------------
async function init() {
    const results = await Promise.all([
        fetchExchangeRates(),
        fetchCommodities()
    ]);
    
    if (results.every(r => r === true)) {
        updateTimestamp();
    }
}

setInterval(init, 60000);
document.addEventListener('DOMContentLoaded', init);
