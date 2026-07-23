// docs/E2E_SCENARIOS.md 準拠の6シナリオ（正常系3・異常系2・境界系1）
//
// 実装上の注意: page-flip は全ページを一度にDOMへ描画し、display:none/blockで表示切替する
// （タブレット/ブック演出のため）。そのため `.mb-member__name` 等のクラスセレクタは
// 常に全ページ分（例: 会員24件なら24個）マッチする。可視ページのみを対象にするため
// Playwrightの `:visible` 擬似クラスで必ず絞り込む。
import { test, expect, type Page } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * page-flip のめくりアニメーション完了を「決め打ちtimeout」ではなく状態変化で待つ。
 * CI（低速環境）×WebKit(モバイル)では、クリック直後の要素がアニメーション中で
 * actionability チェックに失敗しやすいことが判明したため、クリックを行う関数と
 * ページ番号インジケータの変化を待つ処理を1セットにして呼び出し側の取りこぼしを防ぐ。
 */
async function clickAndWaitForPageChange(page: Page, click: () => Promise<void>): Promise<void> {
  const before = await page.locator('#pageIndicator').textContent();
  await click();
  await expect(page.locator('#pageIndicator')).not.toHaveText(before ?? '', { timeout: 5000 });
}

test.describe('E2E-01: 標準的な閲覧フロー（正常系1）', () => {
  test('表紙→目次→会員ページ→次へ→外部リンクの一連の操作ができる', async ({ page, context }) => {
    await page.goto('/');

    // 表紙が表示される
    await expect(page.locator('.mb-cover__title')).toHaveText('メンバーブック');

    // FR-SYS-004: ページ端をクリックすると紙めくりアニメーションで遷移する
    // （page-flipは書籍の右端付近のクリックをめくり操作として認識する）
    const box = await page.locator('.mb-flipbook').boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(700); // flippingTimeの既定アニメーション時間を待つ
    }
    await expect(page.locator('#pageIndicator')).not.toHaveText('1 / 28');

    // 目次の先頭ページまで#nextBtnで確実に戻す（クリックめくりの到達ページはドラッグ量依存のため決定論的にしない）
    for (let i = 0; i < 3; i++) {
      if (await page.locator('.mb-toc__title:visible').first().isVisible().catch(() => false)) break;
      await clickAndWaitForPageChange(page, () => page.locator('#nextBtn').click());
    }
    await expect(page.locator('.mb-toc__title:visible').first()).toBeVisible({ timeout: 5000 });

    // 目次で可視の会員名（先頭）をクリック
    const visibleLink = page.locator('.mb-toc__link:visible').first();
    const memberName = await visibleLink.textContent();
    await clickAndWaitForPageChange(page, () => visibleLink.click());
    await expect(page.locator('.mb-member__name:visible')).toContainText(memberName ?? '', { timeout: 10000 });

    // 次へボタンで1ページ送る（CI×WebKitではアニメーション完了前に次操作すると要素が不安定になるため、
    // ページ番号の変化をもって完了とみなす）
    await clickAndWaitForPageChange(page, () => page.locator('#nextBtn').click());

    // リンクをクリックして新規タブが開く
    const linkLocator = page.locator('.mb-link:visible').first();
    if ((await linkLocator.count()) > 0) {
      const [newPage] = await Promise.all([context.waitForEvent('page'), linkLocator.click()]);
      await newPage.waitForLoadState('domcontentloaded').catch(() => {});
      expect(newPage.url()).toContain('example.com');
      await newPage.close();
    }
  });
});

test.describe('E2E-02: 最小構成相当（境界: 先頭/最終ページのボタン状態）', () => {
  test('先頭ページで前へボタンが非活性になる', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#prevBtn')).toBeDisabled();
    await expect(page.locator('#nextBtn')).toBeEnabled();
  });
});

test.describe('E2E-03: 目次から会員ページへのジャンプ（正常系3）', () => {
  test('目次から任意の会員ページへ直接ジャンプできる', async ({ page }) => {
    await page.goto('/');
    await clickAndWaitForPageChange(page, () => page.locator('#nextBtn').click());
    await expect(page.locator('.mb-toc__title:visible').first()).toBeVisible();

    const link = page.locator('.mb-toc__link:visible').last();
    const name = await link.textContent();
    await clickAndWaitForPageChange(page, () => link.click());

    // page-flipはジャンプ先の見開き(複数ページ)を同時に表示するため、対象名で絞り込んでから可視性を確認する
    // CI×WebKitでは見開きジャンプのアニメーションに時間がかかることがあるためタイムアウトを延長する
    await expect(page.locator('.mb-member__name:visible', { hasText: name ?? '' }).first()).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('E2E-04: page-flip初期化失敗時のフォールバック（異常系1・外部依存障害）', () => {
  test('初期化失敗時もボタンでページ送りが継続できる', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/?__forceInitErrorForTest=1');

    await expect(page.locator('#nextBtn')).toBeVisible();
    await page.locator('#nextBtn').click();
    await expect(page.locator('.mb-toc__title:visible').first()).toBeVisible();

    expect(consoleErrors.some((m) => m.includes('page-flip') || m.includes('初期化'))).toBe(true);
  });
});

test.describe('E2E-05: 不正な会員データによるビルド失敗（異常系2）', () => {
  test('javascript:リンクを含む不正データでvalidate:membersが非ゼロ終了する', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'member-book-e2e05-'));
    const badDataPath = join(dir, 'bad-members.json');
    writeFileSync(
      badDataPath,
      JSON.stringify([
        { id: 'm999', name: 'テスト太郎', bio: '', links: [{ label: '不正リンク', url: 'javascript:alert(1)' }] },
      ]),
    );

    try {
      await execFileAsync('node', ['--experimental-strip-types', 'scripts/validate-members.ts', badDataPath], {
        cwd: process.cwd(),
      });
      throw new Error('validate-members が成功してしまった（不正データが検出されなかった）');
    } catch (error) {
      const err = error as { code?: number; stderr?: string };
      expect(err.code).not.toBe(0);
      expect(err.stderr ?? '').toContain('m999');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

test.describe('E2E-06: 境界値（bio空文字・links0件）での表示崩れなし（境界系）', () => {
  test('m020（リンクなし花子）が表示崩れなく描画される', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nextBtn').click();
    await expect(page.locator('.mb-toc__title:visible').first()).toBeVisible();

    // 目次を必要な分だけめくって m020 を探す
    let found = false;
    for (let i = 0; i < 5 && !found; i++) {
      const link = page.locator('.mb-toc__link:visible', { hasText: 'リンクなし花子' }).first();
      if ((await link.count()) > 0) {
        await clickAndWaitForPageChange(page, () => link.click());
        found = true;
      } else {
        await clickAndWaitForPageChange(page, () => page.locator('#nextBtn').click());
      }
    }
    expect(found).toBe(true);

    // page-flipはジャンプ先の見開き(複数ページ)を同時に表示するため、対象会員のページ(.mb-member)単位で絞り込む
    // CI×WebKitでは見開きジャンプのアニメーションに時間がかかることがあるためタイムアウトを延長する
    const targetPage = page.locator('.mb-member:visible', { hasText: 'リンクなし花子' }).first();
    await expect(targetPage.locator('.mb-member__name')).toHaveText('リンクなし花子', { timeout: 10000 });
    await expect(targetPage.locator('.mb-member__bio')).toHaveText('');
    await expect(targetPage.locator('.mb-member__links')).toHaveCount(0);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  });
});
