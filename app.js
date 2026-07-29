'use strict';

// ジャンルごとの生成ルール定義
const GENRE_CONFIG = {
  '開発ログ': {
    hookEmoji: '💻',
    hooks: ['今日の開発ログです', '今日はこんな作業をしました', '開発の進捗共有です'],
    closingsBase: ['少しずつ、実際の業務で使いやすい形にしています。', 'また一歩、前進できました。', 'コツコツ積み上げていきます。'],
    accentColor: '青',
    composition: '中央にノートパソコンとアプリ画面のイメージ',
    hashtags: ['#開発日記', '#プログラミング初心者', '#駆け出しエンジニア'],
  },
  '制作物の紹介': {
    hookEmoji: '✨',
    hooks: ['新しいものを作りました', '制作物をご紹介します', '今日はこちらを作りました'],
    closingsBase: ['よかったら見てみてください。', '感想もらえたら嬉しいです。', 'これからもアップデートしていきます。'],
    accentColor: '紫',
    composition: '中央に完成物のスクリーンショットやアイコン',
    hashtags: ['#制作日記', '#ポートフォリオ', '#個人開発'],
  },
  'ブログ記事の告知': {
    hookEmoji: '📝',
    hooks: ['新しい記事を書きました', 'ブログを更新しました', '新着記事のお知らせです'],
    closingsBase: ['よかったら読んでみてください。', '感想お待ちしています。', 'コメントもらえると嬉しいです。'],
    accentColor: '緑',
    composition: '中央にブログ記事のタイトルを模したカード',
    hashtags: ['#ブログ更新', '#ブログ初心者', '#Webライティング'],
  },
  'Webライティングの学び': {
    hookEmoji: '✍️',
    hooks: ['今日学んだことをまとめます', 'ライティングの気づきです', '今日のライティング学習記録です'],
    closingsBase: ['引き続き学んでいきます。', '少しずつ書く力をつけていきます。', 'アウトプットも続けていきます。'],
    accentColor: 'オレンジ',
    composition: 'ノートとペン、または文章編集画面のイメージ',
    hashtags: ['#Webライティング', '#ライティング学習', '#学びの記録'],
  },
  'AI活用の記録': {
    hookEmoji: '🤖',
    hooks: ['AIを活用してみました', '今日のAI活用記録です', 'AIを使ってやってみたこと'],
    closingsBase: ['AI活用、まだまだ模索中です。', 'うまく使いこなせるよう試行錯誤中です。', 'また活用例を共有します。'],
    accentColor: '水色',
    composition: 'AIチャット画面やロボットアイコンのイメージ',
    hashtags: ['#AI活用', '#生成AI', '#AIのある生活'],
  },
  '日々の学習記録': {
    hookEmoji: '📚',
    hooks: ['今日の学びを記録します', '今日の学習記録です', '今日のインプットまとめ'],
    closingsBase: ['明日も少しずつ続けます。', 'コツコツ積み重ねていきます。', '毎日の積み重ねを大事にしています。'],
    accentColor: '黄',
    composition: '本や付箋、学習ノートのイメージ',
    hashtags: ['#学習記録', '#今日の学び', '#勉強日記'],
  },
};

const DEFAULT_GENRE_CONFIG = {
  hookEmoji: '📌',
  hooks: ['今日の記録です'],
  closingsBase: ['少しずつ進めていきます。'],
  accentColor: '青',
  composition: '中央にテーマを象徴するシンプルなイラスト',
  hashtags: ['#日記'],
};

// 雰囲気タグごとの調整ルール
const TONE_RULES = {
  '親しみやすい': { closings: ['また進捗共有します！', 'これからもよろしくお願いします！'] },
  '初心者らしい': { prefix: 'まだまだ勉強中ですが、', closings: ['初心者なりに頑張ります。', 'これからも学びながら進めます。'] },
  '前向き': { closings: ['少しずつ前進しています！', 'この調子で続けていきます！'] },
  '丁寧': { formal: true, closings: ['引き続き精進してまいります。'] },
  'カジュアル': { casual: true, closings: ['またぼちぼち共有します〜'] },
  '熱意': { closings: ['もっと良くしていきたいです！🔥'] },
  '真面目': { formal: true, closings: ['引き続き取り組んでまいります。'] },
};

function splitTags(text) {
  return (text || '')
    .split(/[・,、\s\/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickHook(config) {
  return config.hooks[0];
}

function buildBody(todayWork, message) {
  const lines = [];
  if (todayWork) lines.push(todayWork.trim());
  if (message) lines.push('', message.trim());
  return lines.join('\n');
}

function pickClosing(config, toneTags) {
  const candidates = [];
  toneTags.forEach((tag) => {
    const rule = TONE_RULES[tag];
    if (rule && rule.closings) candidates.push(...rule.closings);
  });
  if (candidates.length === 0) candidates.push(...config.closingsBase);
  return candidates[0];
}

function isFormal(toneTags) {
  return toneTags.some((t) => TONE_RULES[t] && TONE_RULES[t].formal);
}

// X表示幅の簡易カウント(全角2/半角1、上限280)
function weightedLength(text) {
  let len = 0;
  for (const ch of text) {
    len += /[＀-￯一-鿿　-〿぀-ヿ]/.test(ch) ? 2 : 1;
  }
  return len;
}

function generatePostText({ genre, todayWork, message, tone, withHashtags }) {
  const config = GENRE_CONFIG[genre] || DEFAULT_GENRE_CONFIG;
  const toneTags = splitTags(tone);

  const hookText = pickHook(config);
  const hook = `${hookText}${config.hookEmoji}`;
  const body = buildBody(todayWork, message);
  const closing = pickClosing(config, toneTags);

  const parts = [hook];
  if (body) parts.push('', body);
  parts.push('', closing);

  let post = parts.join('\n');

  if (withHashtags && config.hashtags.length) {
    post += '\n\n' + config.hashtags.join(' ');
  }

  return post;
}

function generateImagePrompt({ genre, imageDesc, message }) {
  const config = GENRE_CONFIG[genre] || DEFAULT_GENRE_CONFIG;
  const baseDesc = (imageDesc || `シンプルな${genre || ''}用画像`).trim();

  const lines = [
    baseDesc,
    `カラー: ${config.accentColor}系アクセント、白背景、余白を広めに`,
    `構図: ${config.composition}`,
  ];
  if (message) lines.push(`表現したい内容: ${message.trim()}`);
  lines.push('スタイル: 文字は最小限にし、清潔感のあるフラットデザイン');

  return lines.join('\n');
}

function render() {
  const genre = document.getElementById('genre').value;
  const todayWork = document.getElementById('todayWork').value;
  const message = document.getElementById('message').value;
  const tone = document.getElementById('tone').value;
  const imageDesc = document.getElementById('imageDesc').value;
  const withHashtags = document.getElementById('withHashtags').checked;

  if (!todayWork.trim()) {
    alert('「今日やったこと」を入力してください');
    return;
  }

  const postText = generatePostText({ genre, todayWork, message, tone, withHashtags });
  const imagePrompt = generateImagePrompt({ genre, imageDesc, message });

  const postOutput = document.getElementById('postOutput');
  const imageOutput = document.getElementById('imageOutput');
  postOutput.value = postText;
  imageOutput.value = imagePrompt;

  updateCharCount(postText);
  document.getElementById('resultSection').hidden = false;
}

function updateCharCount(text) {
  const len = weightedLength(text);
  const limit = 280;
  const counter = document.getElementById('charCount');
  counter.textContent = `${len} / ${limit}`;
  counter.classList.toggle('over-limit', len > limit);
}

async function copyToClipboard(elementId, buttonEl) {
  const text = document.getElementById(elementId).value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const original = buttonEl.textContent;
    buttonEl.textContent = 'コピーしました！';
    setTimeout(() => {
      buttonEl.textContent = original;
    }, 1500);
  } catch (err) {
    alert('コピーに失敗しました。手動で選択してコピーしてください。');
  }
}

function init() {
  document.getElementById('generateBtn').addEventListener('click', render);
  document.getElementById('copyPostBtn').addEventListener('click', (e) => copyToClipboard('postOutput', e.target));
  document.getElementById('copyImageBtn').addEventListener('click', (e) => copyToClipboard('imageOutput', e.target));
  document.getElementById('postOutput').addEventListener('input', (e) => updateCharCount(e.target.value));
}

document.addEventListener('DOMContentLoaded', init);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js');
  });
}
