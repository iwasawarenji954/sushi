document.addEventListener('DOMContentLoaded', () => {
  // 寿司ネタのリストとローマ字の対応
  const sushiList = [
    //20241127の処理方法だと途中のnn処理が曖昧になります。
    /*
    { japanese: "蓮司",
      romaji  : ["renji", "renzi", "rennji", "rennzi"] },
    */
    { japanese: "サーモン",
      romaji  : ["saamonn", "sa-monn"] },
    /*
    { japanese: "えび",
      romaji  : ["ebi"] },
    { japanese: "いくら",
      romaji  : ["ikura"] },
    { japanese: "たまご",
      romaji  : ["tamago"] },
    { japanese: "かっぱ巻き",
      romaji  : ["kappamaki"] },
    { japanese: "うに",
      romaji  : ["uni"] },
    { japanese: "さば",
      romaji  : ["saba"] },
    { japanese: "蓮司",
      romaji  : ["renzi", "renji"] },
    { japanese: "タケシ",
      romaji  : ["takeshi", "takesi"] },
    { japanese: "成田",
      romaji  : ["narita"] }
    */
  ];

  //DOM要素の取得
  //HTMLのidタグをJSで使えるようにしているConnection
  const sushiArea    = document.getElementById('sushi-area');
  const scoreDisplay = document.getElementById('score');
  const timerDisplay = document.getElementById('timer');
  const missDisplay  = document.getElementById('misses'); // ミスの表示用

  //変数の初期化
  let score = 0;
  let misses = 0;
  let timeLeft = 10;
  let currentSushi = null; // sushiListのオブジェクトの保持
  let currentRomajiIndex = 0; // 現在表示中のローマ字の候補インデックス
  let typedIndex = 0; // 現在の入力位置

  // ランダムな寿司ネタを表示する関数
  function showRandomSushi() {
    // Math.floor(4.5) == 4 (切り捨て)
    // 0 <= Math.random() < 1
    const randomSushiIndex = Math.floor(Math.random() * sushiList.length);
    currentSushi = sushiList[randomSushiIndex];
    currentRomajiIndex = 0; // 最初は最初のローマ字パターンを表示
    typedIndex = 0; // 入力位置をリセット
    sushiArea.innerHTML = `<div class="japanese">${currentSushi.japanese}</div>
                           <div class="romaji">${currentSushi.romaji[currentRomajiIndex]}</div>`;
    document.getElementById('typing-box').value = "";// typing-boxを空にする
  }

  // 初期表示の寿司ネタ
  showRandomSushi();

  // キーボードイベントリスナーで入力を処理
  document.addEventListener('keydown', (event) => {
    //keydownが行われると毎回eventに格納され、関数呼ばれる
    const key = event.key;
    let isKeyCorrect = false;

    // 現在のローマ字候補の中で入力に一致するものを探す
    // currentSushi.romaji.lengthは何種類あるか
    for (let i=0;i<currentSushi.romaji.length;i++) {
      const targetRomaji = currentSushi.romaji[i];
      if (key === targetRomaji[typedIndex]) {
        currentRomajiIndex = i; // i番目のローマ字入力候補に定める
        typedIndex++; // 何番目の文字を次に比較するか
        isKeyCorrect = true;
        break;
      }
    }

    // 入力が一致しなかった場合ミスをカウント
    if (!isKeyCorrect) {
      misses++;
      missDisplay.textContent = `ミス: ${misses}`;
    }

    // ハイライトを更新
    const targetRomaji = currentSushi.romaji[currentRomajiIndex];
    let highlightedRomaji = ""; // ハイライトするための文字列を初期化
    for (let i = 0; i < targetRomaji.length; i++) {
      if (i < typedIndex) {
        highlightedRomaji += `<span class="correct">${targetRomaji[i]}</span>`;
      } else {
        highlightedRomaji += targetRomaji[i];
      }
    }
    sushiArea.innerHTML = `<div class="japanese">${currentSushi.japanese}</div>
                           <div class="romaji">${highlightedRomaji}</div>`;

    // 完全に正しい場合はスコアを増やして次の寿司ネタへ
    if (typedIndex === targetRomaji.length) {
      score++;
      scoreDisplay.textContent = `スコア: ${score}`;
      typedIndex = 0; // 入力位置をリセット
      showRandomSushi(); // 次の寿司ネタを表示
    }
  });

  // タイマーを開始
  const timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `残り時間: ${timeLeft}秒`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval); // タイマーを停止
      sushiArea.textContent = 'ゲーム終了！'; // ゲーム終了メッセージ
      alert(`時間切れ！最終スコアは ${score} です。ミス: ${misses}`);
    }
  }, 1000); // 1秒ごとにカウントダウン
});
