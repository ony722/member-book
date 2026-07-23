// TC-FR-SYS-010: リサイズ通知のデバウンス処理
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeResize } from '../../src/ui/responsive';

describe('observeResize', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resizeイベント発生後、デバウンス時間経過後に1回だけコールバックが呼ばれる', () => {
    const onResize = vi.fn();
    observeResize(onResize, 200);

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));

    expect(onResize).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(onResize).toHaveBeenCalledTimes(1);
  });

  it('返り値の解除関数を呼ぶとresizeイベントに反応しなくなる', () => {
    const onResize = vi.fn();
    const dispose = observeResize(onResize, 100);
    dispose();

    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(200);

    expect(onResize).not.toHaveBeenCalled();
  });
});
