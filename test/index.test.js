import assert from 'node:assert';
import exchange, { usdToKrw, krwToUsd, eurToKrw } from '../src/index.js';

describe('naver-exchange-rate', function() {
  this.timeout(15000);

  it('기본적으로 USD를 KRW로 변환해야 함', async () => {
    const result = await exchange();
    
    assert(result.rate > 1000);
    assert(result.rate < 2000);
    assert.equal(result.from, 'USD');
    assert.equal(result.to, 'KRW');
  });

  it('100달러를 원화로 변환', async () => {
    const result = await exchange({ amount: 100 });
    
    assert(result.result > 100000);
    assert.equal(result.amount, 100);
  });

  it('유로화 환율도 가져올 수 있어야 함', async () => {
    const result = await exchange({ from: 'EUR' });
    
    assert(result.rate > 1000);
    assert.equal(result.from, 'EUR');
  });

  it('원화를 달러로 바꿀 때는 환율이 1보다 작아야 함', async () => {
    const result = await exchange({ 
      from: 'KRW', 
      to: 'USD',
      amount: 10000 
    });
    
    assert(result.rate < 0.001);
    assert(result.result < 10);
  });

  describe('편의 메서드', () => {
    it('usdToKrw는 바로 사용할 수 있어야 함', async () => {
      const result = await usdToKrw(50);
      assert(result.result > 50000);
    });

    it('krwToUsd도 있으면 좋겠다', async () => {
      const result = await krwToUsd(100000);
      assert(result.result < 100);
    });
  });

  describe('에러 케이스', () => {
    it('마이너스 금액은 안됨', async () => {
      try {
        await exchange({ amount: -1 });
        assert.fail('에러가 나야 하는데요...');
      } catch (err) {
        assert(err.message.includes('0보다 큰'));
      }
    });

    it('이상한 통화 코드도 안됨', async () => {
      try {
        await exchange({ from: 'ABC123' });
        assert.fail('에러가 나야 함');
      } catch (err) {
        assert(err.message.includes('통화 코드'));
      }
    });

    it('소문자로 쓰면 안됨', async () => {
      await assert.rejects(
        exchange({ from: 'usd' }),
        /통화 코드/
      );
    });
  });

  it('엔화도 되나?', async () => {
    const result = await exchange({ from: 'JPY', amount: 1000 });
    assert(result.rate > 5);
    assert(result.rate < 20);
  });

  it('태국 바트같은 마이너 통화도 되나 확인', async () => {
    const result = await exchange({ from: 'THB' });
    assert(result.rate > 0);
  });

  it('소수점은 2자리까지만 나와야 함', async () => {
    const result = await exchange({ amount: 123.456789 });
    const decimal = result.result.toString().split('.')[1];
    
    if (decimal) {
      assert(decimal.length <= 2);
    }
  });

  it('결과에 필요한 정보가 다 있나', async () => {
    const result = await exchange({ amount: 77, from: 'EUR' });
    
    assert(result.from);
    assert(result.to);
    assert(result.amount === 77);
    assert(result.rate);
    assert(result.result);
    assert(result.raw);
  });

  it('환율이 말이 되는 숫자인지', async () => {
    const usd = await exchange();
    const eur = await eurToKrw();
    
    assert(usd.rate > 900 && usd.rate < 1600);
    assert(eur.rate > 1000 && eur.rate < 2000);
    assert(eur.rate > usd.rate);
  });

  it('raw 데이터가 있어야 디버깅할 수 있음', async () => {
    const result = await exchange();
    assert(result.raw);
    assert(typeof result.raw === 'object' || typeof result.raw === 'string');
  });
});
