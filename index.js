/**
 * WorkoutGen - 筋トレメニュー自動生成ツール (最終調整版)
 */

// 1. コマンドライン引数の取得 (ここが漏れるとエラーになります)
const args = process.argv.slice(2);
const targets = args.includes("--target") ? args[args.indexOf("--target") + 1].split(",") : ["chest"];
const userLevel = args.includes("--level") ? args[args.indexOf("--level") + 1] : "beginner";
const duration = args.includes("--duration") ? parseInt(args[args.indexOf("--duration") + 1]) : 60;

// 2. 種目データベース
const exerciseDb = {
  warmup: [
    { name: "腕回し・肩甲骨ほぐし", duration: 3, type: "warmup" },
    { name: "ジャンピングジャック", duration: 2, type: "warmup" },
    { name: "キャット＆カウ", duration: 2, type: "warmup" },
    { name: "マウンテンクライマー", duration: 2, type: "warmup" }
  ],
  main: {
    running: [
      { name: "ジョギング", type: "cardio", level: "beginner", defaultReps: "15分", defaultSets: 1 },
      { name: "インターバル走", type: "cardio", level: "advanced", defaultReps: "2分×5本", defaultSets: 1 },
      { name: "ダッシュ", type: "cardio", level: "intermediate", defaultReps: "30秒×10本", defaultSets: 1 }
    ],
    chest: [
      { name: "バーベルベンチプレス", type: "compound", level: "intermediate", defaultReps: "8-10", defaultSets: 3 },
      { name: "プッシュアップ", type: "compound", level: "beginner", defaultReps: "15-20", defaultSets: 3 },
      { name: "ダンベルフライ", type: "isolation", level: "intermediate", defaultReps: "12-15", defaultSets: 3 },
      { name: "ケーブルクロスオーバー", type: "isolation", level: "advanced", defaultReps: "15", defaultSets: 3 }
    ],
    back: [
      { name: "懸垂 (プルアップ)", type: "compound", level: "intermediate", defaultReps: "限界まで", defaultSets: 3 },
      { name: "ベントオーバーロウ", type: "compound", level: "intermediate", defaultReps: "10-12", defaultSets: 3 },
      { name: "デッドリフト", type: "compound", level: "advanced", defaultReps: "5-8", defaultSets: 3 },
      { name: "ラットプルダウン", type: "compound", level: "beginner", defaultReps: "12-15", defaultSets: 3 }
    ],
    shoulders: [
      { name: "オーバーヘッドプレス", type: "compound", level: "intermediate", defaultReps: "8-10", defaultSets: 3 },
      { name: "サイドレイズ", type: "isolation", level: "beginner", defaultReps: "15-20", defaultSets: 3 },
      { name: "リアレイズ", type: "isolation", level: "intermediate", defaultReps: "15", defaultSets: 3 }
    ],
    abs: [
      { name: "クランチ", type: "isolation", level: "beginner", defaultReps: "20", defaultSets: 3 },
      { name: "プランク", type: "isolation", level: "beginner", defaultReps: "60秒", defaultSets: 3 },
      { name: "レッグレイズ", type: "isolation", level: "intermediate", defaultReps: "15", defaultSets: 3 }
    ],
    legs: [
      { name: "バックスクワット", type: "compound", level: "intermediate", defaultReps: "10", defaultSets: 3 },
      { name: "ブルガリアンスクワット", type: "compound", level: "intermediate", defaultReps: "12(片足)", defaultSets: 3 },
      { name: "レッグエクステンション", type: "isolation", level: "beginner", defaultReps: "15", defaultSets: 3 }
    ]
  },
  cooldown: [
    { name: "静的ストレッチ", duration: 5, type: "cooldown" },
    { name: "深呼吸", duration: 2, type: "cooldown" }
  ]
};

// 3. 休息時間の判定ロジック
function getRestTime(exercise) {
  if (exercise.type === "compound") return 90;
  if (exercise.type === "cardio") return 60;
  if (exercise.type === "warmup" || exercise.type === "cooldown") return 0;
  return 30; // isolationなど
}
const readline = require('readline'); // 入力待ち用のモジュール

// ... (exerciseDb と getRestTime はそのまま使用) ...

/**
 * 1種目あたりの所要時間を計算 (秒)
 */
function calculateExDuration(ex) {
  if (ex.duration) return ex.duration * 60; // ウォームアップ等
  const rest = getRestTime(ex);
  // 1セット1分 + 休息時間 で計算
  return ex.defaultSets * (60 + rest);
}

function generateWorkout(targetParts, level, targetDuration) {
  let menu = [];
  let currentTotalSec = 0;
  const targetSec = targetDuration * 60;

  // 1. ウォームアップ (約5-7分)
  const warmups = exerciseDb.warmup.slice(0, 2);
  menu.push(...warmups);
  warmups.forEach(ex => currentTotalSec += calculateExDuration(ex));

  // 2. メイン種目の抽出
  let availableMain = [];
  targetParts.forEach(part => {
    if (exerciseDb.main[part]) {
      const filtered = exerciseDb.main[part].filter(ex => {
        if (level === "advanced") return true;
        if (level === "intermediate") return ex.level !== "advanced";
        return ex.level === "beginner";
      });
      availableMain.push(...filtered);
    }
  });

  // ランダムシャッフル
  availableMain.sort(() => Math.random() - 0.5);
  // コンパウンド優先
  availableMain.sort((a, b) => (a.type === "compound" ? -1 : 1));

  // 3. 時間に収まるまで種目を追加
  for (const ex of availableMain) {
    const exSec = calculateExDuration(ex);
    if (currentTotalSec + exSec + (5 * 60) <= targetSec) { // クールダウン分5分を残す
      menu.push(ex);
      currentTotalSec += exSec;
    }
  }

  // 4. クールダウン
  menu.push(exerciseDb.cooldown[0]);
  
  return menu;
}

/**
 * 対話型インターフェースの実行
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askUser() {
  const menu = generateWorkout(targets, userLevel, duration);
  
  console.clear();
  console.log(`\n🔥 提案メニュー (${userLevel} / 目標:${duration}分)`);
  console.log(`----------------------------------------------------------`);
  menu.forEach((ex, i) => {
    const detail = ex.defaultReps ? `${ex.defaultSets}セット × ${ex.defaultReps}` : `${ex.duration}分`;
    console.log(`${String(i + 1).padStart(2)}. ${ex.name.padEnd(18)} | ${detail}`);
  });
  console.log(`----------------------------------------------------------`);
  
  rl.question('👉 このメニューで決定しますか？ (y:決定 / n:再生成 / q:終了): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      console.log('\n💪 よし、トレーニング開始だ！頑張りましょう！\n');
      rl.close();
    } else if (answer.toLowerCase() === 'n') {
      askUser(); // 再帰的に実行して新メニュー作成
    } else {
      console.log('\n👋 お疲れ様でした！\n');
      rl.close();
    }
  });
}

askUser();
// 実行
generateWorkout(targets, userLevel, duration);