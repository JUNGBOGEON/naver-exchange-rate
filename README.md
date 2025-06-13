# naver-api-exchange-rate

네이버 환율 정보를 쉽게 가져올 수 있는 Node.js 라이브러리입니다.

## 설치

```bash
npm install naver-api-exchange-rate
```

## 사용법

### 기본 사용법

```javascript
import exchange from 'naver-api-exchange-rate';

// 1달러를 원화로 변환
const result = await exchange();
console.log(result);
// {
//   from: 'USD',
//   to: 'KRW',
//   amount: 1,
//   rate: 1367.90,
//   result: 1367.90,
//   raw: '...'
// }
```

### 다양한 사용 방법

```javascript
import exchange from 'naver-api-exchange-rate';

// 100달러를 원화로 변환
const result1 = await exchange({ amount: 100 });
console.log(`100달러 = ${result1.result}원`);

// 유로를 원화로 변환
const result2 = await exchange({ from: 'EUR', to: 'KRW' });
console.log(`1유로 = ${result2.rate}원`);

// 원화를 달러로 변환
const result3 = await exchange({ 
  amount: 10000, 
  from: 'KRW', 
  to: 'USD' 
});
console.log(`10000원 = ${result3.result}달러`);
```

### 편의 메서드

자주 사용하는 환율 변환을 위한 간편한 메서드를 제공합니다:

```javascript
import { usdToKrw, krwToUsd, eurToKrw, jpyToKrw, cnyToKrw } from 'naver-api-exchange-rate';

// 50달러를 원화로
const krw = await usdToKrw(50);
console.log(`50달러 = ${krw.result}원`);

// 10000원을 달러로
const usd = await krwToUsd(10000);
console.log(`10000원 = ${usd.result}달러`);

// 100유로를 원화로
const eurResult = await eurToKrw(100);
console.log(`100유로 = ${eurResult.result}원`);
```

### 지원 통화

모든 3자리 ISO 통화 코드를 지원합니다:

```javascript
import exchange from 'naver-api-exchange-rate';

// 엔화를 원화로
const result = await exchange({
  from: 'JPY',
  to: 'KRW',
  amount: 1000
});

// 다양한 통화 예시
const thb = await exchange({ from: 'THB', to: 'KRW' });  // 태국 바트
const nzd = await exchange({ from: 'NZD', to: 'KRW' });  // 뉴질랜드 달러
const inr = await exchange({ from: 'INR', to: 'KRW' });  // 인도 루피
const mxn = await exchange({ from: 'MXN', to: 'KRW' });  // 멕시코 페소
```

## API

### exchange(options)

환율을 변환합니다.

#### 옵션

- `amount` (number): 변환할 금액 (기본값: 1)
- `from` (string): 출발 통화 코드 - 3자리 ISO 코드 (기본값: 'USD')
- `to` (string): 도착 통화 코드 - 3자리 ISO 코드 (기본값: 'KRW')

#### 반환값

```javascript
{
  from: 'USD',  // 출발 통화
  to: 'KRW',    // 도착 통화
  amount: 1,    // 입력 금액
  rate: 1367.90,    // 환율
  result: 1367.90,  // 변환된 금액
  raw: '...'    // 원본 응답 데이터
}
```

### 편의 메서드

- `usdToKrw(amount)`: USD → KRW 변환
- `krwToUsd(amount)`: KRW → USD 변환
- `eurToKrw(amount)`: EUR → KRW 변환
- `jpyToKrw(amount)`: JPY → KRW 변환
- `cnyToKrw(amount)`: CNY → KRW 변환

### 상수

- `CURRENCIES`: 주요 통화 코드 예시

### 헬퍼 함수

- `getSupportedCurrencies()`: 주요 통화 코드 예시 배열 반환

## 에러 처리

```javascript
import exchange from 'naver-api-exchange-rate';

try {
  const result = await exchange({ amount: -100 });
} catch (error) {
  console.error(error.message);
  // "금액은 0보다 큰 숫자여야 합니다."
}

try {
  const result = await exchange({ from: 'INVALID' });
} catch (error) {
  console.error(error.message);
  // "잘못된 통화 코드 형식입니다: INVALID. 3자리 대문자여야 합니다 (예: USD, EUR, JPY)"
}
```

## 주의사항

- 이 라이브러리는 네이버의 환율 계산기를 사용합니다
- 실시간 환율은 은행 및 시장 상황에 따라 달라질 수 있습니다

## 라이선스

MIT
