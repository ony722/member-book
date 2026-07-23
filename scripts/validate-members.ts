// FR-DATA-001: ビルド前に members.json を検証し、不正データはビルド自体を失敗させる（CC-01/CC-04）
// dataLoader.ts の検証ロジックをそのまま再利用する（DRY、実行時検証とのロジック重複を避ける）
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadMembers, ValidationError } from '../src/core/dataLoader.ts';

const targetPath = process.argv[2] ?? fileURLToPath(new URL('../src/data/members.json', import.meta.url));

function main(): void {
  const raw = readFileSync(targetPath, 'utf-8');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    console.error(`[validate-members] JSONパースエラー: ${targetPath}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    const members = loadMembers(json);
    console.log(`[validate-members] OK: ${members.length}件の会員データを検証しました（${targetPath}）`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`[validate-members] スキーマ検証エラー: ${error.message}`);
    } else {
      console.error('[validate-members] 予期しないエラー:', error);
    }
    process.exit(1);
  }
}

main();
