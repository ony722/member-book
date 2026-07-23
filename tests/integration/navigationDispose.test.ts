// navigation.ts の残余分岐（ArrowLeft・dispose）を検証
import { beforeEach, describe, expect, it } from 'vitest';
import { buildPages } from '../../src/core/pageModel';
import { mount } from '../../src/ui/flipBookView';
import { bindControls } from '../../src/ui/navigation';
import type { Member } from '../../src/core/types';

function makeMembers(count: number): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m${String(i + 1).padStart(3, '0')}`,
    name: `会員${i + 1}`,
    bio: '',
    links: [],
  }));
}

describe('bindControls 残余分岐', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="flipbook"></div>';
  });

  it('ArrowLeftキーで前ページへ戻る', () => {
    const container = document.getElementById('flipbook') as HTMLElement;
    const { pages, memberIndex } = buildPages(makeMembers(3));
    const handle = mount(container, pages, memberIndex, { __forceInitErrorForTest: true });
    bindControls(handle, { container, tocPageIndex: 1 });

    handle.flipToPage(2);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(handle.getCurrentPage()).toBe(1);
  });

  it('dispose()後はクリック・キー操作に反応しなくなる', () => {
    const container = document.getElementById('flipbook') as HTMLElement;
    const { pages, memberIndex } = buildPages(makeMembers(3));
    const handle = mount(container, pages, memberIndex, { __forceInitErrorForTest: true });
    const nav = bindControls(handle, { container, tocPageIndex: 1 });

    nav.dispose();
    const before = handle.getCurrentPage();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(handle.getCurrentPage()).toBe(before);
  });

  it('data属性を持たない要素をクリックしても何も起きない', () => {
    const container = document.getElementById('flipbook') as HTMLElement;
    const { pages, memberIndex } = buildPages(makeMembers(3));
    const handle = mount(container, pages, memberIndex, { __forceInitErrorForTest: true });
    bindControls(handle, { container, tocPageIndex: 1 });

    const before = handle.getCurrentPage();
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handle.getCurrentPage()).toBe(before);
  });
});
