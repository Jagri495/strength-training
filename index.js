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

// 4. メニュー生成関数
function generateWorkout(targetParts, level, targetDuration) {
  console.log("📋 本日のメニュー生成中...");
  console.log("-----------------------");

  let menu = [];

  // ウォームアップ
  menu.push(...exerciseDb.warmup.slice(0, 2));

  // メイン種目の抽出
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

  // シャッフル & ソート (コンパウンド優先)
  availableMain.sort(() => Math.random() - 0.5);
  availableMain.sort((a, b) => (a.type === "compound" ? -1 : 1));

  // 時間調整
  const mainCount = Math.max(2, Math.floor((targetDuration - 15) / 10));
  menu.push(...availableMain.slice(0, mainCount));

  // クールダウン
  menu.push(...exerciseDb.cooldown);

  // 表示
  console.log(`\n🔥 生成されたメニュー (${level} / ${targetDuration}分)`);
  console.log(`----------------------------------------------------------`);
  console.log(` 種目名               | 内容               | 休息(秒)`);
  console.log(`----------------------------------------------------------`);
  
  menu.forEach((ex, i) => {
    const detail = ex.defaultReps ? `${ex.defaultSets}セット × ${ex.defaultReps}` : `${ex.duration}分`;
    const rest = getRestTime(ex);
    const restDisplay = rest > 0 ? `${rest}s` : "--";

    console.log(`${String(i + 1).padStart(2)}. ${ex.name.padEnd(18)} | ${detail.padEnd(16)} | ${restDisplay}`);
  });
  console.log(`----------------------------------------------------------`);
}

// 実行
generateWorkout(targets, userLevel, duration);