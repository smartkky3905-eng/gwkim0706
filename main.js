// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const lastUpdatedEl = document.getElementById('last-updated');

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
// COMMODITY DATA (USD/ton 기준 추출 및 처리)
// ------------------------------------------------------------------
async function fetchCommodities() {
    try {
        // 실제 API 연동 시 아래 주석을 해제하고 URL을 입력하세요.
        // const response = await fetch('YOUR_API_ENDPOINT');
        // const result = await response.json();

        // [제공해주신 API 구조 샘플]
        const result = { 
            "data": { 
                "success": true, 
                "rates": { 
                    "USD": 1,
                    "LME-XCU": 0.0001186, // (예시) 1달러당 톤수
                    "LME-LEAD": 0.0004750,
                    "LME-ALU": 0.0004405,
                    "IRON": 0.0088339,
                    "USDLME-XCU": 8432.50, // (직접 가격) USD per Ton
                    "USDLME-LEAD": 2105.00,
                    "USDLME-ALU": 2270.50,
                    "USDIRON": 113.20
                } 
            } 
        };

        const rates = result.data.rates;

        // USD/ton 가격 추출 함수
        // 직접 가격(USDXXX)이 있으면 사용하고, 없으면 역수(1/XXX)로 계산합니다.
        const getPricePerTon = (symbol) => {
            const directKey = 'USD' + symbol;
            if (rates[directKey]) return rates[directKey]; // 직접 가격 사용
            if (rates[symbol]) return 1 / rates[symbol];  // 역수 계산 (1 USD / 톤당 USD)
            return null;
        };

        const commodities = [
            { id: 'copper', symbol: 'LME-XCU', label: 'LME Copper Grade A' },
            { id: 'lead', symbol: 'LME-LEAD', label: 'LME Lead Standard' },
            { id: 'aluminum', symbol: 'LME-ALU', label: 'LME Aluminum HG' },
            { id: 'iron', symbol: 'IRON', label: 'Iron Ore 62% Fe' }
        ];

        commodities.forEach(item => {
            const price = getPricePerTon(item.symbol);
            if (price) {
                updateCard(item.id, '$' + price.toLocaleString(undefined, {maximumFractionDigits: 2}), item.label);
            }
        });

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
    
    // 값이 변경될 때만 효과를 주기 위해 체크
    if (valueEl.textContent !== value && valueEl.textContent !== '---') {
        valueEl.style.color = '#e53e3e';
        setTimeout(() => valueEl.style.color = '#2d3748', 1000);
    }
    
    valueEl.textContent = value;
    footerEl.textContent = footer;
}

function updateTimestamp() {
    const now = new Date();
    lastUpdatedEl.innerHTML = `실시간 USD/ton 반영 중: ${now.toLocaleTimeString()} <i class="fa-solid fa-sync fa-spin"></i>`;
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
