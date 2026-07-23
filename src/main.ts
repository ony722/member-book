// エントリポイント（SDD.md 第4章「実行環境」「デプロイ方法」/ 第2章「メインフロー」）

// page-flip本体のスタイル（.stf__item等のページ表示/非表示制御に必須。
// Round1後の実装検証で発見: このCSSなしではクリックによるめくり操作が正しく機能しない）
import 'page-flip/src/Style/stPageFlip.css';
import './style.css';
import membersJson from './data/members.json';
import { loadMembers, ValidationError } from './core/dataLoader';
import { buildPages } from './core/pageModel';
import { mount } from './ui/flipBookView';
import { bindControls } from './ui/navigation';
import { bindPageIndicator } from './ui/pageIndicator';
import { bindFullscreenToggle } from './ui/fullscreen';
import { observeResize } from './ui/responsive';

function main(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <div class="mb-app">
      <div class="mb-flipbook" id="flipbook" role="region" aria-label="メンバーブック"></div>
      <div class="mb-controls">
        <button id="prevBtn" class="mb-btn" type="button" aria-label="前のページへ">◀ 前へ</button>
        <span id="pageIndicator" class="mb-indicator" aria-live="polite"></span>
        <button id="nextBtn" class="mb-btn" type="button" aria-label="次のページへ">次へ ▶</button>
        <button id="fullscreenBtn" class="mb-btn" type="button" aria-label="全画面表示">⛶ 全画面</button>
      </div>
    </div>
  `;

  const flipbookEl = document.getElementById('flipbook');
  const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
  const fullscreenBtn = document.getElementById('fullscreenBtn') as HTMLButtonElement | null;
  const pageIndicatorEl = document.getElementById('pageIndicator');
  const appRoot = document.querySelector<HTMLElement>('.mb-app');

  if (!flipbookEl || !prevBtn || !nextBtn || !fullscreenBtn || !pageIndicatorEl || !appRoot) {
    return;
  }

  let members;
  try {
    members = loadMembers(membersJson);
  } catch (error) {
    // FR-SYS-001例外条件: JSON読み込み失敗時
    const message = error instanceof ValidationError ? error.message : String(error);
    console.error('[main] 会員データの読み込みに失敗しました:', message);
    app.innerHTML = '<p class="mb-error">会員データを読み込めませんでした</p>';
    return;
  }

  const { pages, memberIndex } = buildPages(members);
  const firstTocIndex = Math.max(
    pages.findIndex((p) => p.type === 'toc'),
    1,
  );

  // Round1レビュー指摘F-C1対応: E2E-04用のテスト専用障害注入フック（URLクエリパラメータ方式）
  const forceInitErrorForTest = new URLSearchParams(location.search).has('__forceInitErrorForTest');

  const handle = mount(flipbookEl, pages, memberIndex, {
    __forceInitErrorForTest: forceInitErrorForTest,
    onInitError: (error) => {
      console.error('[FlipBookView] page-flip の初期化に失敗しました。フォールバック表示に切り替えます。', error);
    },
  });

  bindControls(handle, {
    container: flipbookEl,
    nextBtn,
    prevBtn,
    tocPageIndex: firstTocIndex,
  });
  bindPageIndicator(handle, pageIndicatorEl);
  bindFullscreenToggle(fullscreenBtn, appRoot);
  observeResize(() => {
    /* page-flip の size:'stretch' が主対応。将来の追加リサイズ処理のためのフック */
  });
}

main();
