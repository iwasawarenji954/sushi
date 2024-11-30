import { sushiList } from './sushiList.js';
import { audioPaths } from './audioPath.js';

document.addEventListener('DOMContentLoaded', () => {
  //DOM要素の取得
  //HTMLのidタグをJSで使えるようにしているConnection
  const sushiArea    = document.getElementById('sushi-area');
  const scoreDisplay = document.getElementById('score');
  const timerDisplay = document.getElementById('timer');
  const missDisplay  = document.getElementById('misses'); // ミスの表示用

  //audio関係
  const correctSound = new Audio(audioPaths.correct);
  const missSound    = new Audio(audioPaths.miss);
  const typingSound  = new Audio(audioPaths.typing);

  //変数の初期化
  let score              = 0;
  let misses             = 0;
  let timeLeft           = -1;
  let currentSushi       = null; // sushiListのオブジェクトの保持
  let currentRomajiIndex = 0; // 現在表示中のローマ字の候補インデックス
  let typedIndex         = 0; // 現在の入力位置
  let isGameStarted      = false; // ゲームが開始されているかの状態
  let timerInterval = null; // タイマーのIDを保持

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

  // タイマー処理
  function startTimer() {
    console.log("タイマーを開始します");
    const timerInterval = setInterval(() => {
      if (timeLeft > 0){
        timeLeft--;
        timerDisplay.textContent = `残り時間: ${timeLeft}秒`;
      }

      if (timeLeft === 0) {
        clearInterval(timerInterval); // タイマー停止
        sushiArea.textContent = 'ゲーム終了！';
        alert(`時間切れ！最終スコアは ${score} です。ミス: ${misses}`);
        isGameStarted = false; // ゲームを終了状態に戻す
      }
    }, 1000);
  }

  // ゲーム開始処理
  function startGame() {
    if (isGameStarted) return; // すでにゲームが開始されている場合は何もしない
    if (timeLeft === -1){
      isGameStarted = true; // ゲームを開始状態に変更
      timeLeft = 60;
      showRandomSushi(); // 最初の寿司を表示
      startTimer(); // タイマーを開始
    }
  }

  // ゲームリセット処理
  function resetGame() {
    clearInterval(timerInterval); // タイマーを停止
    score = 0;
    misses = 0;
    timeLeft = -1;// 0以上だとtimer動く
    isGameStarted = false;

    // 初期状態の表示をリセット
    sushiArea.textContent = "スペースキーまたはエンターキーでゲーム開始";
    scoreDisplay.textContent = "スコア: 0";
    timerDisplay.textContent = "start!";
    missDisplay.textContent  = " ";
  }

  function playCorrectSound() {
    correctSound.currentTime = 0;
    correctSound.volume = 1.0; // 0.0~1.0までしか扱えない
    correctSound.play();
  }

  function playMissSound() {
    missSound.currentTime = 0;
    missSound.volume = 1.0;
    missSound.play();
  }

  function playTypingSound() {
    typingSound.currentTime = 0;
    typingSound.volume = 1.0;
    typingSound.play();
  }

  // キーボードイベントリスナーで入力を処理
  document.addEventListener('keydown', (event) => {
    if (event.key === " " || event.key === "Enter") {
      startGame(); // ゲーム開始
    } else if (event.key === "Escape") {
      resetGame(); // ゲームリセット
    } else if (isGameStarted){
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
          playTypingSound();
          break;
        }
      }

      // 入力が一致しなかった場合ミスをカウント
      if (!isKeyCorrect && key !== " " && key !== "Enter" && key !== "Backspace") {
        playMissSound();
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
        playCorrectSound();
        score++;
        scoreDisplay.textContent = `スコア: ${score}`;
        typedIndex = 0; // 入力位置をリセット
        showRandomSushi(); // 次の寿司ネタを表示
      }
    }
  });
})
