// TC-FR-SYS-009: 全画面表示トグル
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindFullscreenToggle } from '../../src/ui/fullscreen';

describe('bindFullscreenToggle', () => {
  let button: HTMLButtonElement;
  let target: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<button id="fs"></button><div id="target"></div>';
    button = document.getElementById('fs') as HTMLButtonElement;
    target = document.getElementById('target') as HTMLElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(document, 'fullscreenEnabled', { value: undefined, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: undefined, configurable: true });
  });

  it('Fullscreen API未対応時はボタンを非表示にする（例外条件）', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: false, configurable: true });
    bindFullscreenToggle(button, target);
    expect(button.style.display).toBe('none');
  });

  it('未全画面時にクリックするとrequestFullscreenを呼ぶ', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    target.requestFullscreen = requestFullscreen;

    bindFullscreenToggle(button, target);
    button.click();

    expect(requestFullscreen).toHaveBeenCalled();
  });

  it('全画面中にクリックするとexitFullscreenを呼ぶ', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: target, configurable: true });
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = exitFullscreen;

    bindFullscreenToggle(button, target);
    button.click();

    expect(exitFullscreen).toHaveBeenCalled();
  });

  it('dispose関数でイベントリスナーを解除できる', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    target.requestFullscreen = requestFullscreen;

    const dispose = bindFullscreenToggle(button, target);
    dispose();
    button.click();

    expect(requestFullscreen).not.toHaveBeenCalled();
  });
});
