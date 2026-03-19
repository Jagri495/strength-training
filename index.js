// 簡易版 WorkoutGen ロジック
const args = process.argv.slice(2);
console.log("📋 本日のメニュー生成中...");
console.log("-----------------------");

// フェーズ1：ウォームアップ
console.log("【ウォームアップ】 約10分");
console.log("  1. 動的ストレッチ");

// フェーズ2：メイントレーニング
console.log("【メイントレーニング】");
console.log("  2. コンパウンド種目（スクワット等）");
console.log("  3. アイソレーション種目");

// フェーズ3：クールダウン
console.log("【クールダウン】 約10分");
console.log("  4. 静的ストレッチ");