import { URLSearchParams } from 'node:url';

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  CNY: 'CNY',
  GBP: 'GBP',
  KRW: 'KRW',
  AUD: 'AUD',
  CAD: 'CAD',
  CHF: 'CHF',
  HKD: 'HKD',
  SGD: 'SGD',
  THB: 'THB',
};

const DEFAULTS = {
  bank: 'keb',
  amount: 1,
  from: CURRENCIES.USD,
  to: CURRENCIES.KRW,
  unit: 'standardUnit',
  direction: 'down',
  pkid: 141,
};

function validateOptions(options) {
  if (options.amount !== undefined) {
    const amount = Number(options.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('금액은 0보다 큰 숫자여야 합니다.');
    }
  }

  if (options.from && (typeof options.from !== 'string' || !/^[A-Z]{3}$/.test(options.from))) {
    throw new Error(`잘못된 통화 코드 형식입니다: ${options.from}. 3자리 대문자여야 합니다 (예: USD, EUR, JPY)`);
  }

  if (options.to && (typeof options.to !== 'string' || !/^[A-Z]{3}$/.test(options.to))) {
    throw new Error(`잘못된 통화 코드 형식입니다: ${options.to}. 3자리 대문자여야 합니다 (예: USD, EUR, JPY)`);
  }

}

export async function convert(options = {}) {
  try {
    validateOptions(options);

    const opts = { ...DEFAULTS, ...options };
    const q = encodeURIComponent('환율');
    const params = new URLSearchParams({
      key: 'calculator',
      pkid: opts.pkid,
      q,
      where: 'm',
      u1: opts.bank,
      u2: opts.amount,
      u3: opts.from,
      u4: opts.to,
      u6: opts.unit,
      u7: '0',
      u8: opts.direction,
    });

    const url = `https://m.search.naver.com/p/csearch/content/qapirender.nhn?${params.toString()}`;
    
    let res;
    try {
      res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      throw new Error(`네트워크 오류가 발생했습니다: ${error.message}`);
    }

    const body = await res.text();
    let rate;
    try {
      const jsonData = typeof body === 'string' ? JSON.parse(body) : body;

      if (jsonData.country && jsonData.country.length >= 2) {
        const fromValue = parseFloat(jsonData.country[0].value.replace(/,/g, ''));
        const toValue = parseFloat(jsonData.country[1].value.replace(/,/g, ''));
        rate = toValue / fromValue;
      }
    } catch (jsonError) {
      const match = body.match(/<span class="rate _rate">([\d,.]+)<\/span>/);
      if (!match) {
        throw new Error('환율 정보를 파싱할 수 없습니다.');
      }
      rate = parseFloat(match[1].replace(/,/g, ''));
    }
    
    if (isNaN(rate) || rate <= 0) {
      throw new Error('올바르지 않은 환율 값입니다');
    }

    return {
      from: opts.from,
      to: opts.to,
      amount: opts.amount,
      rate,
      result: Math.round(rate * opts.amount * 100) / 100,
      raw: body,
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`네이버 서버 오류 (${error.response.status}): ${error.response.statusText}`);
    }
    throw error;
  }
}

export function getSupportedCurrencies() {
  return Object.values(CURRENCIES);
}

export const exchange = convert;

export const usdToKrw = (amount = 1) => convert({ amount, from: 'USD', to: 'KRW' });
export const krwToUsd = (amount = 1) => convert({ amount, from: 'KRW', to: 'USD' });
export const eurToKrw = (amount = 1) => convert({ amount, from: 'EUR', to: 'KRW' });
export const jpyToKrw = (amount = 1) => convert({ amount, from: 'JPY', to: 'KRW' });
export const cnyToKrw = (amount = 1) => convert({ amount, from: 'CNY', to: 'KRW' });

export default exchange;
