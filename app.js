/* =========================================================
   英語習熟トレーナー  アプリ本体（SPA）  v3
   学習目的: 内容の「把握」と「定着」
   - 合格までのステップ（診断 → 講義 → 演習）
   - 演習は「選択 → 解答する」2段階＋「わからない」＋「💡ヒント」
   - 解説は「模範解説 → ポイント → さらに詳しい解説」
   - ステップ型読解 / 品詞識別 / 難易度3段階 / 経過タイマー
   - 🔊 音声読み上げ（Web Speech API）
   - 本格SRS（間隔反復）＋復習センター（今日の復習 / 弱点復習）
   - 間違いだけ再挑戦 / 学習ストリーク（連続学習日数）
   - 小学生は学年目安（小1〜）順に並び、1年生から積み上げられる
   ========================================================= */

const STORE_KEY = "eng-mastery-trainer-v2";

/* ---------- 進捗データ ---------- */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      p.units = p.units || {};
      p.problems = p.problems || {};
      p.streak = p.streak || 0;
      return p;
    }
  } catch (e) {}
  return { studyMode: "detail", units: {}, problems: {}, streak: 0, lastStudyDate: null };
}
function saveProgress() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  } catch (e) {}
}
let progress = loadProgress();

/* ---------- データ参照ヘルパ ---------- */
function getStage(id) {
  return CURRICULUM.find((s) => s.id === id);
}
function getUnit(unitId) {
  for (const stage of CURRICULUM) {
    const u = stage.units.find((x) => x.id === unitId);
    if (u) return { unit: u, stage };
  }
  return null;
}
function gradeOf(unitId) {
  return UNIT_GRADE[unitId] || { label: "", order: 9 };
}
/* 区分の単元を学年目安（order）順に並べる。小1の学習者は先頭から積み上げられる。 */
function sortedUnits(stage) {
  return stage.units
    .map((u, i) => ({ u, i }))
    .sort((a, b) => gradeOf(a.u.id).order - gradeOf(b.u.id).order || a.i - b.i)
    .map((x) => x.u);
}
function unitState(unitId) {
  if (!progress.units[unitId]) {
    progress.units[unitId] = { diagnosed: false, lectureDone: false, bestScore: 0, attempts: 0, perfectRuns: 0 };
  }
  return progress.units[unitId];
}
function masteryOf(unitId) {
  const st = progress.units[unitId];
  if (!st || st.attempts === 0) return MASTERY_LEVELS[0];
  const score = st.bestScore;
  let level = MASTERY_LEVELS[1];
  for (const lv of MASTERY_LEVELS) if (lv.min >= 0 && score >= lv.min) level = lv;
  return level;
}
function medalOf(unitId) {
  const st = progress.units[unitId];
  if (!st) return null;
  for (const m of MEDALS) if (st.perfectRuns >= m.runs) return m;
  return null;
}
const DIFF_META = {
  基礎: { color: "#16a34a" },
  標準: { color: "#2f6fed" },
  発展: { color: "#c9582b" },
};
function difficultyOf(unit, idx) {
  const ex = unit.exercises[idx];
  if (ex && ex.difficulty) return ex.difficulty;
  const r = idx / Math.max(1, unit.exercises.length);
  return r < 0.34 ? "基礎" : r < 0.67 ? "標準" : "発展";
}
function problemKey(unitId, idx) {
  return unitId + "::" + idx;
}
function problemStatus(unitId, idx) {
  const p = progress.problems[problemKey(unitId, idx)];
  if (!p) return null; // 未判定
  if (p.last === "wrong") return "weak";
  if (p.wrongCount > 0) return "vague";
  return "learned";
}
const STATUS_META = {
  weak: { label: "苦手", color: "#dc2626", emoji: "🔴" },
  vague: { label: "うろ覚え", color: "#d97706", emoji: "🟡" },
  learned: { label: "覚えた", color: "#16a34a", emoji: "🟢" },
};
function stageProgress(stage) {
  const total = stage.units.length;
  let passed = 0,
    scoreSum = 0;
  stage.units.forEach((u) => {
    if (masteryOf(u.id).key === "passed") passed++;
    const st = progress.units[u.id];
    scoreSum += st ? st.bestScore : 0;
  });
  return { total, passed, avg: Math.round(scoreSum / total) };
}

/* ---------- SRS（間隔反復） ---------- */
function scheduleSrs(p, correct) {
  p.srs = p.srs || { streak: 0, due: 0 };
  if (correct) {
    p.srs.streak = Math.min(p.srs.streak + 1, SRS_INTERVALS.length);
    const days = SRS_INTERVALS[p.srs.streak - 1];
    p.srs.due = Date.now() + days * 86400000;
  } else {
    p.srs.streak = 0;
    p.srs.due = Date.now() + 86400000; // 翌日に再挑戦
  }
}
function isProblemDue(p) {
  return !!(p && p.srs && p.srs.due && p.srs.due <= Date.now());
}
function collectProblems(filterFn) {
  const out = [];
  CURRICULUM.forEach((stage) =>
    stage.units.forEach((u) =>
      u.exercises.forEach((ex, idx) => {
        const p = progress.problems[problemKey(u.id, idx)];
        if (filterFn(p, u, idx, ex)) out.push({ ex, idx, unitId: u.id, unitTitle: u.title, stage: stage.stage });
      })
    )
  );
  return out;
}
const dueProblems = () => collectProblems((p) => isProblemDue(p));
const weakProblems = () =>
  collectProblems((p) => {
    if (!p) return false;
    const s = p.last === "wrong" ? "weak" : p.wrongCount > 0 ? "vague" : "learned";
    return s === "weak" || s === "vague";
  });

/* ---------- 学習ストリーク（連続学習日数） ---------- */
function dateStr(d) {
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}
function updateStreak() {
  const today = dateStr(new Date());
  if (progress.lastStudyDate === today) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  progress.streak = progress.lastStudyDate === dateStr(y) ? (progress.streak || 0) + 1 : 1;
  progress.lastStudyDate = today;
  saveProgress();
}
function renderStreak() {
  const b = document.getElementById("streakBadge");
  if (!b) return;
  if (progress.streak > 0) {
    b.hidden = false;
    b.textContent = "🔥 " + progress.streak + "日連続";
  } else b.hidden = true;
}

/* ---------- 音声読み上げ（Web Speech API） ---------- */
function speak(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.92;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
function englishOf(text) {
  const m = String(text).match(/[A-Za-z][A-Za-z0-9 .,'?!:;()\-]*/g);
  if (!m) return "";
  return m
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .join(". ")
    .replace(/\s+/g, " ")
    .trim();
}
function ttsBtn(text) {
  const eng = englishOf(text);
  if (!eng) return "";
  return `<button class="tts-btn" data-speak="${escapeHtml(eng)}" type="button" title="英語を読み上げる" aria-label="英語を読み上げる">🔊</button>`;
}

/* ---------- ユーティリティ ---------- */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return String(Math.floor(s / 60)).padStart(2, "0") + "分" + String(s % 60).padStart(2, "0") + "秒";
}
function explanationHtml(ex) {
  let html = `<div class="exp-block"><span class="exp-label">模範解説</span><p>${escapeHtml(ex.explain || "")}</p></div>`;
  if (ex.points && ex.points.length) {
    html += `<div class="exp-block"><span class="exp-label">ポイント（解き方の手順）</span><ol class="exp-points">${ex.points
      .map((p) => `<li>${escapeHtml(p)}</li>`)
      .join("")}</ol></div>`;
  }
  if (ex.more) {
    html += `<details class="exp-more"><summary>さらに詳しい解説を開く</summary><p>${escapeHtml(ex.more)}</p></details>`;
  }
  return html;
}
function hintTextOf(ex) {
  if (ex.hint) return ex.hint;
  if (ex.points && ex.points.length) return ex.points[0];
  if (ex.type && typeof GENERIC_HINT !== "undefined" && GENERIC_HINT[ex.type]) return GENERIC_HINT[ex.type];
  return "";
}

/* ---------- ルーティング ---------- */
const app = document.getElementById("app");
let route = { name: "home" };
let timerInterval = null;

function navigate(name, params) {
  // 演習から離れるときはセッションを破棄（中断状態を残さない）
  if (route.name === "exercise" && name !== "exercise" && session) session = null;
  route = Object.assign({ name }, params || {});
  window.scrollTo(0, 0);
  render();
}
function render() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  renderGlobalProgress();
  renderStreak();
  if (route.name === "home") return renderHome();
  if (route.name === "tips") return renderTips();
  if (route.name === "status") return renderStatus();
  if (route.name === "review") return renderReview();
  if (route.name === "stage") return renderStage(route.stageId);
  if (route.name === "unit") return renderUnit(route.unitId);
  if (route.name === "lecture") return renderLecture(route.unitId);
  if (route.name === "diagnosis") return renderDiagnosis(route.unitId);
  if (route.name === "exercise") return renderExercise();
  renderHome();
}

/* ---------- グローバル進捗バー ---------- */
function renderGlobalProgress() {
  const strip = document.getElementById("globalProgress");
  let total = 0,
    passed = 0;
  CURRICULUM.forEach((s) => {
    total += s.units.length;
    s.units.forEach((u) => {
      if (masteryOf(u.id).key === "passed") passed++;
    });
  });
  const pct = total ? Math.round((passed / total) * 100) : 0;
  strip.innerHTML = `<div class="progress-fill" style="width:${pct}%"></div>
    <span class="progress-label">全体習熟 ${passed}/${total} 単元 合格（${pct}%）</span>`;
}

/* ---------- ホーム ---------- */
function renderHome() {
  const mode = progress.studyMode || "detail";
  const due = dueProblems().length;
  const stagesHtml = CURRICULUM.map((stage) => {
    const p = stageProgress(stage);
    const pct = Math.round((p.passed / p.total) * 100);
    return `
      <button class="stage-card" data-go-stage="${stage.id}" type="button" style="--c:${stage.color}">
        <div class="stage-card-head">
          <span class="stage-chip" style="background:${stage.color}">${stage.stage}</span>
          <span class="stage-count">${stage.units.length}単元</span>
        </div>
        <p class="stage-card-desc">${stage.desc}</p>
        <div class="bar"><div class="bar-fill" style="width:${pct}%;background:${stage.color}"></div></div>
        <div class="stage-card-foot"><span>合格 ${p.passed}/${p.total}</span><span>平均習熟 ${p.avg}%</span></div>
      </button>`;
  }).join("");

  const modeBtns = Object.entries(STUDY_MODES)
    .map(
      ([key, m]) => `
      <button class="mode-pill ${key === mode ? "active" : ""}" data-mode="${key}" type="button">
        <span>${m.icon}</span><strong>${m.label}</strong>
      </button>`
    )
    .join("");

  const reviewBanner =
    due > 0
      ? `<button class="review-banner" data-nav="review" type="button">
           🔁 <strong>今日の復習が ${due}問</strong> たまっています — 復習センターへ
         </button>`
      : "";

  app.innerHTML = `
    <section class="hero">
      <div class="wrap">
        <h1>英語を「区分 × 学習単元」で<br />把握し、定着させる学習アプリ</h1>
        <p class="hero-lead">小学生・中学生・高校生の3区分。各単元を「診断 → 講義 → 演習」で進め、
        <strong>💡ヒント</strong>と<strong>模範解説</strong>で内容を<strong>把握</strong>。
        <strong>🔊音声読み上げ</strong>・<strong>間隔反復の復習</strong>・<strong>連続学習</strong>で<strong>定着</strong>させます。</p>
        ${reviewBanner}
        <div class="mode-row">
          <span class="mode-row-label">学習の進め方</span>
          <div class="mode-pills">${modeBtns}</div>
        </div>
        <p class="mode-desc">${STUDY_MODES[mode].desc}</p>
      </div>
    </section>
    <section class="wrap">
      <h2 class="section-title">学習区分を選ぶ</h2>
      <div class="stage-grid">${stagesHtml}</div>
    </section>`;
}

/* ---------- 学習のコツ ---------- */
function renderTips() {
  const scheduleHtml = STUDY_TIPS.schedule.map((s) => `<li>${s}</li>`).join("");
  const sectionsHtml = STUDY_TIPS.sections
    .map(
      (sec) => `
      <div class="tip-card">
        <h3><span class="tip-icon">${sec.icon}</span>${sec.area}</h3>
        <ul>${sec.points.map((p) => `<li>${p}</li>`).join("")}</ul>
      </div>`
    )
    .join("");
  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-nav="home" type="button">← ホーム</button>
      <h1 class="page-title">学習のコツ</h1>
      <p class="tips-intro">${STUDY_TIPS.intro}</p>
      <div class="tip-card schedule">
        <h3><span class="tip-icon">🗓️</span>全体スケジュールと優先順位</h3>
        <ul>${scheduleHtml}</ul>
      </div>
      <h2 class="section-title">分野別の進め方</h2>
      <div class="tip-grid">${sectionsHtml}</div>
    </section>`;
}

/* ---------- 復習センター ---------- */
function renderReview() {
  const due = dueProblems();
  const weak = weakProblems();
  app.innerHTML = `
    <section class="wrap narrow">
      <button class="back-link" data-nav="home" type="button">← ホーム</button>
      <h1 class="page-title">復習センター</h1>
      <p class="tips-intro">間隔反復（翌日 → 3日 → 7日 → 16日 → 35日）で、忘れる前に復習して定着させます。</p>

      <div class="review-card">
        <div class="review-card-head"><span class="review-emoji">🔁</span><h3>今日の復習</h3></div>
        <p class="review-desc">復習のタイミングが来た問題：<strong>${due.length}問</strong></p>
        ${
          due.length
            ? `<button class="btn primary wide" data-review-start="due" type="button">今日の復習を始める（${due.length}問）</button>`
            : `<p class="review-empty">いまは復習予定の問題はありません。演習を進めると、復習日が自動で設定されます。</p>`
        }
      </div>

      <div class="review-card">
        <div class="review-card-head"><span class="review-emoji">🔴</span><h3>弱点をまとめて復習</h3></div>
        <p class="review-desc">「苦手」「うろ覚え」の問題：<strong>${weak.length}問</strong></p>
        ${
          weak.length
            ? `<button class="btn primary wide" data-review-start="weak" type="button">弱点を復習する（${weak.length}問）</button>`
            : `<p class="review-empty">弱点として記録された問題はありません。よくできています！</p>`
        }
      </div>
    </section>`;
}

/* ---------- 区分（単元一覧） ---------- */
function renderStage(stageId) {
  const stage = getStage(stageId);
  if (!stage) return navigate("home");
  const units = sortedUnits(stage);
  const unitsHtml = units
    .map((u, i) => {
      const m = masteryOf(u.id);
      const medal = medalOf(u.id);
      const st = progress.units[u.id];
      const score = st ? st.bestScore : 0;
      const g = gradeOf(u.id);
      return `
      <button class="unit-row" data-go-unit="${u.id}" type="button">
        <span class="unit-no">${i + 1}</span>
        <span class="unit-main">
          <span class="unit-title">${u.title} <span class="tier-mark" title="基礎・標準・発展の3段階で構成">+++</span> ${
        medal ? `<span class="medal">${medal.emoji}</span>` : ""
      }</span>
          <span class="unit-goal">${u.goal}</span>
        </span>
        <span class="unit-meta">
          ${g.label ? `<span class="grade-badge">${g.label}</span>` : ""}
          <span class="mastery-badge" style="background:${m.color}">${m.label}</span>
          <span class="unit-score">${st && st.attempts ? score + "%" : "未挑戦"}</span>
        </span>
      </button>`;
    })
    .join("");
  const p = stageProgress(stage);
  const elemNote =
    stage.id === "elementary"
      ? `<p class="stage-note">📌 小学1年生からでも、<strong>いちばん上の単元から順に</strong>始められます。学年目安（小1〜）のバッジを参考に、自分の位置から積み上げましょう。</p>`
      : "";
  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-nav="home" type="button">← ホーム</button>
      <div class="stage-header" style="--c:${stage.color}">
        <span class="stage-chip lg" style="background:${stage.color}">${stage.stage}</span>
        <p>${stage.desc}</p>
        <div class="stage-header-stat">合格 ${p.passed}/${p.total} ・ 平均習熟 ${p.avg}%</div>
      </div>
      ${elemNote}
      <h2 class="section-title">学習単元（学年目安の早い順。上から進めるのが基本）</h2>
      <div class="unit-list">${unitsHtml}</div>
    </section>`;
}

/* ---------- 単元トップ（合格までのステップ） ---------- */
function renderUnit(unitId) {
  const found = getUnit(unitId);
  if (!found) return navigate("home");
  const { unit, stage } = found;
  const st = unitState(unitId);
  const mode = progress.studyMode || "detail";
  const m = masteryOf(unitId);
  const medal = medalOf(unitId);
  const g = gradeOf(unitId);

  const diffCount = { 基礎: 0, 標準: 0, 発展: 0 };
  unit.exercises.forEach((_, i) => diffCount[difficultyOf(unit, i)]++);

  let rec = "exercise";
  if (mode === "detail") {
    if (!st.diagnosed) rec = "diagnosis";
    else if (!st.lectureDone) rec = "lecture";
    else rec = "exercise";
  } else {
    rec = st.lectureDone ? "exercise" : "lecture";
  }

  const stepCard = (icon, name, desc, done, action, recommended, locked) => `
    <button class="step-card ${done ? "done" : ""} ${recommended ? "recommended" : ""} ${locked ? "locked" : ""}"
      data-step="${action}" type="button" ${locked ? "disabled" : ""}>
      <span class="step-icon">${icon}</span>
      <span class="step-body">
        <span class="step-name">${name}
          ${done ? '<span class="step-done">完了</span>' : ""}
          ${recommended ? '<span class="step-rec">おすすめ</span>' : ""}
          ${locked ? '<span class="step-lock">診断後に解放</span>' : ""}
        </span>
        <span class="step-desc">${desc}</span>
      </span>
      <span class="step-arrow">›</span>
    </button>`;

  const exTotal = unit.exercises.length;
  const lectureLocked = mode === "detail" && !st.diagnosed;

  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-go-stage="${stage.id}" type="button">← ${stage.stage}の単元一覧</button>
      <div class="unit-header" style="--c:${stage.color}">
        <div class="unit-header-top">
          <span class="stage-chip" style="background:${stage.color}">${stage.stage}</span>
          ${g.label ? `<span class="grade-badge lg">学年目安 ${g.label}</span>` : ""}
        </div>
        <h1>${unit.title} <span class="tier-mark big">+++</span> ${medal ? `<span class="medal lg">${medal.emoji}</span>` : ""}</h1>
        <p class="unit-header-goal"><strong>この単元のゴール：</strong>${unit.goal}</p>
        <div class="tier-row">
          <span class="tier-chip" style="--c:${DIFF_META.基礎.color}">基礎 ${diffCount.基礎}問</span>
          <span class="tier-chip" style="--c:${DIFF_META.標準.color}">標準 ${diffCount.標準}問</span>
          <span class="tier-chip" style="--c:${DIFF_META.発展.color}">発展 ${diffCount.発展}問</span>
        </div>
        <div class="unit-header-stat">
          <span class="mastery-badge" style="background:${m.color}">習熟：${m.label}</span>
          <span>最高スコア ${st.attempts ? st.bestScore + "%" : "—"}</span>
          <span>挑戦 ${st.attempts}回</span>
          <span>${medal ? medal.label : "メダル未獲得"}</span>
        </div>
      </div>
      <h2 class="section-title">合格までのステップ</h2>
      <div class="step-list">
        ${
          mode === "detail"
            ? stepCard("🩺", "1. 理解度をチェック（診断）", "今の理解度をかんたんに自己診断する。", st.diagnosed, "diagnosis", rec === "diagnosis", false)
            : ""
        }
        ${stepCard(
          "📘",
          mode === "detail" ? "2. 講義で学ぶ" : "1. 講義（要点）",
          mode === "detail" ? "要点を講義で学び、解き方の土台をつくる。" : "要点だけ高速チェック。",
          st.lectureDone,
          "lecture",
          rec === "lecture",
          lectureLocked
        )}
        ${stepCard(
          "✏️",
          mode === "detail" ? "3. 演習で定着させる" : "2. 演習で定着させる",
          `全${exTotal}問。💡ヒント・🔊音声・構造化解説つき。解いた問題は復習日が自動設定されます。`,
          st.bestScore > 0,
          "exercise",
          rec === "exercise",
          false
        )}
      </div>
      <div class="medal-hint">🥈 1周全問正解で銀メダル ／ 🥇 2周で金メダル ／ 🌟 3周でシャイニーメダル</div>
    </section>`;
}

/* ---------- 診断 ---------- */
function renderDiagnosis(unitId) {
  const { unit } = getUnit(unitId);
  app.innerHTML = `
    <section class="wrap narrow">
      <button class="back-link" data-go-unit="${unitId}" type="button">← ${unit.title}</button>
      <div class="panel">
        <span class="panel-tag">🩺 診断</span>
        <h1>${unit.title}</h1>
        <p class="diag-q">${unit.diagnosis}</p>
        <p class="diag-help">いまの理解度を自己判定してください。判定の結果に応じて、講義から始めるか演習に進むかを選べます。</p>
        <div class="diag-btns">
          <button class="btn primary" data-diag="ok" type="button">だいたい分かる → 演習へ進む</button>
          <button class="btn" data-diag="ng" type="button">あやしい → 講義から学ぶ</button>
        </div>
      </div>
    </section>`;
}

/* ---------- 講義 ---------- */
function renderLecture(unitId) {
  const { unit } = getUnit(unitId);
  const mode = progress.studyMode || "detail";
  const pointsHtml = unit.lecture
    .map((pt) => `<div class="lec-point"><h3>${pt.h}</h3>${mode === "detail" ? `<p>${pt.body}</p>` : ""}</div>`)
    .join("");
  app.innerHTML = `
    <section class="wrap narrow">
      <button class="back-link" data-go-unit="${unitId}" type="button">← ${unit.title}</button>
      <div class="panel">
        <span class="panel-tag">📘 講義${mode === "quick" ? "（要点モード）" : ""}</span>
        <h1>${unit.title}</h1>
        <p class="lec-goal">${unit.goal}</p>
        <div class="lec-points">${pointsHtml}</div>
        <button class="btn primary wide" data-lecture-done="${unitId}" type="button">講義を終えて演習へ →</button>
      </div>
    </section>`;
}

/* ---------- 演習エンジン ---------- */
let session = null;

function startExercise(unitId) {
  const { unit } = getUnit(unitId);
  session = {
    mode: "unit",
    unitId,
    items: unit.exercises.map((ex, idx) => ({ ex, idx, unitId })),
    pos: 0,
    correct: 0,
    answered: false,
    results: [],
    startTime: Date.now(),
    sub: { pos: 0, log: [] },
    hintUsed: false,
  };
  renderExercise();
}
function startCustomSession(items, label) {
  if (!items.length) return;
  session = {
    mode: "review",
    reviewLabel: label,
    items: items.map((it) => ({ ex: it.ex, idx: it.idx, unitId: it.unitId })),
    pos: 0,
    correct: 0,
    answered: false,
    results: [],
    startTime: Date.now(),
    sub: { pos: 0, log: [] },
    hintUsed: false,
  };
  navigate("exercise");
}

function startTimer() {
  const tick = () => {
    const s = document.getElementById("exTimer");
    if (s && session) s.textContent = fmtTime(Date.now() - session.startTime);
  };
  tick();
  timerInterval = setInterval(tick, 1000);
}

function renderExercise() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (!session) {
    if (route.unitId) return startExercise(route.unitId);
    return navigate("home");
  }
  if (session.mode === "unit" && route.unitId && session.unitId !== route.unitId) {
    return startExercise(route.unitId);
  }
  const total = session.items.length;
  if (session.pos >= total) return renderExerciseResult();

  const item = session.items[session.pos];
  const ex = item.ex,
    idx = item.idx,
    itemUnitId = item.unitId;
  const unit = getUnit(itemUnitId).unit;
  const diff = difficultyOf(unit, idx);
  const pstatus = problemStatus(itemUnitId, idx);
  const statusTag = pstatus
    ? `<span class="pstatus" style="color:${STATUS_META[pstatus].color}">${STATUS_META[pstatus].emoji} ${STATUS_META[pstatus].label}</span>`
    : `<span class="pstatus" style="color:#8b97a6">⚪ 未判定</span>`;
  const typeLabel = { choice: "選択式", order: "並べ替え式", input: "入力式", pos: "品詞選択", label: "品詞識別", steps: "ステップ型読解" }[ex.type];

  const backBtn =
    session.mode === "review"
      ? `<button class="back-link" data-nav="review" type="button">← 復習をやめる</button>`
      : `<button class="back-link" data-go-unit="${itemUnitId}" type="button">← 演習をやめる</button>`;
  const sessionTag =
    session.mode === "review" ? `<span class="review-tag">🔁 ${escapeHtml(session.reviewLabel || "復習")}</span>` : "";

  app.innerHTML = `
    <section class="wrap narrow">
      ${backBtn}
      <div class="ex-progress">
        <div class="ex-progress-bar"><div style="width:${(session.pos / total) * 100}%"></div></div>
        <span class="ex-counter">問題 ${session.pos + 1} / ${total}</span>
        <span class="ex-timer">⏱ <span id="exTimer">00分00秒</span></span>
      </div>
      <div class="panel ex-panel">
        <div class="ex-head">
          ${sessionTag}
          <span class="ex-type">${typeLabel}</span>
          <span class="diff-badge" style="background:${DIFF_META[diff].color}">${diff}</span>
          <span class="ex-correct">正解 ${session.correct}</span>
          ${statusTag}
        </div>
        <div id="exBody"></div>
        <div class="ex-feedback" id="exFeedback" hidden></div>
        <button class="btn primary wide" id="exNext" type="button" hidden>次へ →</button>
      </div>
    </section>`;

  startTimer();
  const body = document.getElementById("exBody");
  if (ex.type === "choice" || ex.type === "pos") renderChoice(ex, idx, body);
  else if (ex.type === "order") renderOrder(ex, idx, body);
  else if (ex.type === "input") renderInput(ex, idx, body);
  else if (ex.type === "label") renderLabel(ex, idx, body);
  else if (ex.type === "steps") renderSteps(ex, idx, body);
}

/* ヒント箱 */
function hintBoxHtml() {
  return `<div class="hint-box" id="hintBox" hidden></div>`;
}
function hintButton(ex) {
  if (!hintTextOf(ex)) return null;
  const btn = el(`<button class="btn ghost hint-btn" type="button">💡 ヒント</button>`);
  btn.addEventListener("click", () => {
    if (session.answered) return;
    session.hintUsed = true;
    const box = document.getElementById("hintBox");
    if (box) {
      box.hidden = false;
      box.innerHTML = `<span class="hint-label">💡 ヒント</span><p>${escapeHtml(hintTextOf(ex))}</p>`;
    }
    btn.disabled = true;
  });
  return btn;
}
function dontKnowButton(ex, idx) {
  const btn = el(`<button class="btn ghost dk-btn" type="button">わからない</button>`);
  btn.addEventListener("click", () => {
    if (session.answered) return;
    finishAnswer(ex, idx, false, true);
  });
  return btn;
}

/* 共通: 解答確定後の処理 */
function finishAnswer(ex, idx, isCorrect, dontKnow) {
  if (session.answered) return;
  session.answered = true;
  const item = session.items[session.pos];
  recordProblem(item.unitId, idx, isCorrect, dontKnow);
  if (isCorrect) session.correct++;
  session.results.push({ idx, correct: isCorrect, dontKnow: !!dontKnow, item });
  const feedback = document.getElementById("exFeedback");
  feedback.hidden = false;
  feedback.className = "ex-feedback " + (isCorrect ? "ok" : "ng");
  const head = isCorrect ? "⭕ 正解！" : dontKnow ? "❓ わからない（苦手として記録しました）" : "❌ 不正解";
  feedback.innerHTML = `<strong>${head}</strong>${explanationHtml(ex)}`;
  const nextBtn = document.getElementById("exNext");
  nextBtn.hidden = false;
  nextBtn.textContent = session.pos + 1 >= session.items.length ? "結果を見る →" : "次へ →";
  nextBtn.focus();
}

/* 選択式 / 品詞選択 */
function renderChoice(ex, idx, body) {
  const sentence =
    ex.type === "pos"
      ? `<p class="ex-sentence">${escapeHtml(ex.sentence).replace(
          escapeHtml(ex.target),
          `<u>${escapeHtml(ex.target)}</u>`
        )} ${ttsBtn(ex.sentence)}</p><p class="ex-q">下線部「${escapeHtml(ex.target)}」について答えましょう。</p>`
      : "";
  body.innerHTML = `
    ${sentence}
    <p class="ex-q">${escapeHtml(ex.q)} ${ttsBtn(ex.q)}</p>
    ${hintBoxHtml()}
    <div class="choices">
      ${ex.choices
        .map((c, i) => `<button class="choice-btn" data-choice="${i}" type="button"><span class="choice-no">${i + 1}</span>${escapeHtml(c)}</button>`)
        .join("")}
    </div>
    <div class="ex-actions">
      <span class="ex-actions-spacer"></span>
      <button class="btn primary" id="choiceSubmit" type="button" disabled>解答する</button>
    </div>`;
  const actions = body.querySelector(".ex-actions");
  const hb = hintButton(ex);
  if (hb) actions.prepend(hb);
  actions.prepend(dontKnowButton(ex, idx));

  let selected = -1;
  const submit = document.getElementById("choiceSubmit");
  body.querySelectorAll(".choice-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (session.answered) return;
      selected = i;
      body.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      submit.disabled = false;
    });
  });
  submit.addEventListener("click", () => {
    if (session.answered || selected < 0) return;
    const correct = selected === ex.answer;
    body.querySelectorAll(".choice-btn").forEach((b, bi) => {
      b.disabled = true;
      if (bi === ex.answer) b.classList.add("correct");
      if (bi === selected && !correct) b.classList.add("wrong");
    });
    submit.disabled = true;
    finishAnswer(ex, idx, correct);
  });
}

/* 並べ替え */
function renderOrder(ex, idx, body) {
  const tokens = shuffle(ex.tokens);
  body.innerHTML = `
    <p class="ex-q">${escapeHtml(ex.q)}</p>
    ${hintBoxHtml()}
    <div class="order-answer" id="orderAnswer" aria-label="解答欄"></div>
    <div class="order-tokens" id="orderTokens">
      ${tokens.map((t) => `<button class="token" data-token="${escapeHtml(t)}" type="button">${escapeHtml(t)}</button>`).join("")}
    </div>
    <div class="ex-actions">
      <button class="btn small" id="orderClear" type="button">クリア</button>
      <button class="btn primary small" id="orderCheck" type="button">解答する</button>
    </div>`;
  const actions = body.querySelector(".ex-actions");
  const hb = hintButton(ex);
  if (hb) actions.prepend(hb);
  actions.prepend(dontKnowButton(ex, idx));

  const answerBox = document.getElementById("orderAnswer");
  const tokenBox = document.getElementById("orderTokens");
  const picked = [];
  function refresh() {
    answerBox.innerHTML = picked
      .map((t, i) => `<button class="token in-answer" data-remove="${i}" type="button">${escapeHtml(t)}</button>`)
      .join("");
    answerBox.querySelectorAll("[data-remove]").forEach((b) => {
      b.addEventListener("click", () => {
        if (session.answered) return;
        const [tok] = picked.splice(Number(b.dataset.remove), 1);
        const back = tokenBox.querySelector(`.token[data-token="${CSS.escape(tok)}"][hidden]`);
        if (back) back.hidden = false;
        refresh();
      });
    });
  }
  tokenBox.querySelectorAll(".token").forEach((b) => {
    b.addEventListener("click", () => {
      if (session.answered) return;
      picked.push(b.dataset.token);
      b.hidden = true;
      refresh();
    });
  });
  document.getElementById("orderClear").addEventListener("click", () => {
    if (session.answered) return;
    picked.length = 0;
    tokenBox.querySelectorAll(".token").forEach((b) => (b.hidden = false));
    refresh();
  });
  document.getElementById("orderCheck").addEventListener("click", () => {
    if (session.answered) return;
    if (picked.length !== ex.answer.length) {
      answerBox.classList.add("shake");
      setTimeout(() => answerBox.classList.remove("shake"), 400);
      return;
    }
    const correct = picked.join(" ") === ex.answer.join(" ");
    answerBox.innerHTML =
      `<div class="order-result">あなたの解答：${escapeHtml(picked.join(" "))}</div>` +
      `<div class="order-result correct-line">正解：${escapeHtml(ex.answer.join(" "))} ${ttsBtn(ex.answer.join(" "))}</div>`;
    finishAnswer(ex, idx, correct);
  });
}

/* 入力式 */
function renderInput(ex, idx, body) {
  body.innerHTML = `
    <p class="ex-q">${escapeHtml(ex.q)}</p>
    ${hintBoxHtml()}
    <div class="input-row">
      <input type="text" id="inputAnswer" class="text-input" placeholder="ここに入力" autocomplete="off" />
    </div>
    <div class="ex-actions">
      <span class="ex-actions-spacer"></span>
      <button class="btn primary" id="inputCheck" type="button">解答する</button>
    </div>`;
  const actions = body.querySelector(".ex-actions");
  const hb = hintButton(ex);
  if (hb) actions.prepend(hb);
  actions.prepend(dontKnowButton(ex, idx));

  const input = document.getElementById("inputAnswer");
  function check() {
    if (session.answered) return;
    const val = input.value.trim();
    if (!val) {
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      return;
    }
    const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.．。、,]/g, "").trim();
    const correct = ex.answers.some((a) => norm(a) === norm(val));
    input.disabled = true;
    input.classList.add(correct ? "correct" : "wrong");
    if (!correct) input.parentElement.after(el(`<p class="input-correct">正解例：${escapeHtml(ex.answers[0])}</p>`));
    finishAnswer(ex, idx, correct);
  }
  document.getElementById("inputCheck").addEventListener("click", check);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") check();
  });
  input.focus();
}

/* 品詞識別（label） */
const LABEL_OPTS = ["S", "V", "O", "C", "M"];
const LABEL_DESC = { S: "主語", V: "動詞", O: "目的語", C: "補語", M: "修飾語" };
function renderLabel(ex, idx, body) {
  const picks = new Array(ex.chunks.length).fill(null);
  body.innerHTML = `
    <p class="ex-q">${escapeHtml(ex.instruction || "各まとまりに文の要素 S/V/O/C/M を割り当てよう。")}</p>
    ${hintBoxHtml()}
    <p class="label-sentence">${escapeHtml(ex.sentence)} ${ttsBtn(ex.sentence)}</p>
    <div class="label-legend">${LABEL_OPTS.map((l) => `<span><b>${l}</b>＝${LABEL_DESC[l]}</span>`).join("")}</div>
    <div class="label-board">
      ${ex.chunks
        .map(
          (c, ci) => `
        <div class="label-chunk" data-ci="${ci}">
          <span class="chunk-text">${escapeHtml(c)}</span>
          <div class="label-opts">
            ${LABEL_OPTS.map((l) => `<button class="label-opt" data-ci="${ci}" data-label="${l}" type="button">${l}</button>`).join("")}
          </div>
        </div>`
        )
        .join("")}
    </div>
    <div class="ex-actions">
      <span class="ex-actions-spacer"></span>
      <button class="btn primary" id="labelCheck" type="button">解答する</button>
    </div>`;
  const actions = body.querySelector(".ex-actions");
  const hb = hintButton(ex);
  if (hb) actions.prepend(hb);
  actions.prepend(dontKnowButton(ex, idx));

  body.querySelectorAll(".label-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (session.answered) return;
      const ci = Number(btn.dataset.ci);
      picks[ci] = btn.dataset.label;
      body.querySelectorAll(`.label-opt[data-ci="${ci}"]`).forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
  document.getElementById("labelCheck").addEventListener("click", () => {
    if (session.answered) return;
    if (picks.some((p) => p === null)) {
      body.querySelector(".label-board").classList.add("shake");
      setTimeout(() => body.querySelector(".label-board").classList.remove("shake"), 400);
      return;
    }
    let allCorrect = true;
    ex.chunks.forEach((c, ci) => {
      const chunkEl = body.querySelector(`.label-chunk[data-ci="${ci}"]`);
      const ok = picks[ci] === ex.labels[ci];
      if (!ok) allCorrect = false;
      chunkEl.classList.add(ok ? "chunk-ok" : "chunk-ng");
      chunkEl.querySelectorAll(".label-opt").forEach((b) => {
        b.disabled = true;
        if (b.dataset.label === ex.labels[ci]) b.classList.add("correct");
        if (b.dataset.label === picks[ci] && !ok) b.classList.add("wrong");
      });
      chunkEl.insertAdjacentHTML("beforeend", `<span class="chunk-judge">${ok ? "⭕" : "❌ 正解 " + ex.labels[ci]}</span>`);
    });
    finishAnswer(ex, idx, allCorrect);
  });
}

/* ステップ型読解（steps） */
function renderSteps(ex, idx, body) {
  if (!session.sub || session.sub.itemIdx !== session.pos) {
    session.sub = { itemIdx: session.pos, pos: 0, log: [] };
  }
  const sub = session.sub;
  const stepsDone = sub.log
    .map(
      (l, i) =>
        `<div class="step-done-row"><span class="step-done-no">STEP${i + 1}</span>
         <span class="${l.correct ? "sd-ok" : "sd-ng"}">${l.correct ? "⭕" : "❌"} ${escapeHtml(l.chosen)}</span></div>`
    )
    .join("");

  body.innerHTML = `
    <p class="ex-q">${escapeHtml(ex.instruction || "ステップを踏んでから設問に答えよう。")}</p>
    <div class="passage-box">${escapeHtml(ex.passage)} ${ttsBtn(ex.passage)}</div>
    <div class="steps-log">${stepsDone}</div>
    <div id="stepArea"></div>`;
  const area = document.getElementById("stepArea");

  if (sub.pos < ex.steps.length) {
    const step = ex.steps[sub.pos];
    area.innerHTML = `
      <div class="substep">
        <span class="substep-tag">STEP ${sub.pos + 1} / ${ex.steps.length}</span>
        <p class="ex-q">${escapeHtml(step.q)}</p>
        <div class="choices">
          ${step.choices.map((c, i) => `<button class="choice-btn" data-sc="${i}" type="button"><span class="choice-no">${i + 1}</span>${escapeHtml(c)}</button>`).join("")}
        </div>
        <div class="substep-feedback" id="substepFb" hidden></div>
        <button class="btn primary wide" id="stepNext" type="button" hidden>次のステップへ →</button>
      </div>`;
    const fb = document.getElementById("substepFb");
    const nextBtn = document.getElementById("stepNext");
    let stepAnswered = false;
    area.querySelectorAll(".choice-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (stepAnswered) return;
        stepAnswered = true;
        const ok = i === step.answer;
        area.querySelectorAll(".choice-btn").forEach((b, bi) => {
          b.disabled = true;
          if (bi === step.answer) b.classList.add("correct");
          if (bi === i && !ok) b.classList.add("wrong");
        });
        sub.log.push({ correct: ok, chosen: step.choices[i] });
        fb.hidden = false;
        fb.className = "substep-feedback " + (ok ? "ok" : "ng");
        fb.innerHTML = `<strong>${ok ? "⭕ そのとおり" : "❌ ちがいます"}</strong><p>${escapeHtml(step.hint || "")}</p>`;
        nextBtn.hidden = false;
        nextBtn.textContent = sub.pos + 1 >= ex.steps.length ? "設問に進む →" : "次のステップへ →";
        nextBtn.focus();
      });
    });
    nextBtn.addEventListener("click", () => {
      sub.pos++;
      renderSteps(ex, idx, body);
    });
  } else {
    area.innerHTML = `
      <div class="substep main-q">
        <span class="substep-tag main">設問</span>
        <p class="ex-q">${escapeHtml(ex.main.q)}</p>
        ${hintBoxHtml()}
        <div class="choices">
          ${ex.main.choices.map((c, i) => `<button class="choice-btn" data-mc="${i}" type="button"><span class="choice-no">${i + 1}</span>${escapeHtml(c)}</button>`).join("")}
        </div>
        <div class="ex-actions">
          <span class="ex-actions-spacer"></span>
          <button class="btn primary" id="stepsSubmit" type="button" disabled>解答する</button>
        </div>
      </div>`;
    const actions = area.querySelector(".ex-actions");
    const hb = hintButton(ex.main);
    if (hb) actions.prepend(hb);
    actions.prepend(dontKnowButton(ex.main, idx));
    let selected = -1;
    const submit = document.getElementById("stepsSubmit");
    area.querySelectorAll(".choice-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (session.answered) return;
        selected = i;
        area.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        submit.disabled = false;
      });
    });
    submit.addEventListener("click", () => {
      if (session.answered || selected < 0) return;
      const correct = selected === ex.main.answer;
      area.querySelectorAll(".choice-btn").forEach((b, bi) => {
        b.disabled = true;
        if (bi === ex.main.answer) b.classList.add("correct");
        if (bi === selected && !correct) b.classList.add("wrong");
      });
      submit.disabled = true;
      finishAnswer(ex.main, idx, correct);
    });
  }
}

function recordProblem(unitId, idx, isCorrect, dontKnow) {
  const key = problemKey(unitId, idx);
  const p = progress.problems[key] || { wrongCount: 0, rightCount: 0, dkCount: 0, last: null };
  if (isCorrect) p.rightCount++;
  else p.wrongCount++;
  if (dontKnow) p.dkCount = (p.dkCount || 0) + 1;
  p.last = isCorrect ? "right" : "wrong";
  scheduleSrs(p, isCorrect);
  progress.problems[key] = p;
  saveProgress();
}

function renderExerciseResult() {
  const total = session.items.length;
  const score = Math.round((session.correct / total) * 100);
  const elapsed = Date.now() - session.startTime;
  const isReview = session.mode === "review";
  const isPerfect = session.correct === total;
  let m = null,
    medal = null,
    unit = null,
    stage = null;

  if (!isReview) {
    const found = getUnit(session.unitId);
    unit = found.unit;
    stage = found.stage;
    const st = unitState(session.unitId);
    st.attempts++;
    if (score > st.bestScore) st.bestScore = score;
    if (isPerfect) st.perfectRuns++;
    st.lectureDone = st.lectureDone || true;
    st.lastStudied = Date.now();
    saveProgress();
    m = masteryOf(session.unitId);
    medal = medalOf(session.unitId);
  }
  updateStreak();

  const reviewHtml = session.results
    .map((r) => {
      const ex = r.item.ex;
      const label = { choice: "選択", order: "並べ替え", input: "入力", pos: "品詞", label: "品詞識別", steps: "読解" }[ex.type];
      const q = ex.type === "steps" ? ex.main.q : ex.q || ex.sentence;
      const mark = r.correct ? "⭕" : r.dontKnow ? "❓" : "❌";
      return `<li class="${r.correct ? "ok" : "ng"}"><span>${mark}</span><span class="rev-q">[${label}] ${escapeHtml(q)}</span></li>`;
    })
    .join("");

  const wrongCount = session.results.filter((r) => !r.correct).length;
  const retryBtn = wrongCount
    ? `<button class="btn" data-retry-wrong="1" type="button">間違えた${wrongCount}問だけやり直す</button>`
    : "";

  const headerHtml = isReview
    ? `<span class="panel-tag">🔁 復習結果</span><h1>${escapeHtml(session.reviewLabel || "復習")}</h1>`
    : `<span class="panel-tag">✏️ 演習結果</span><h1>${unit.title}</h1>`;
  const masteryLine = isReview
    ? `<p class="result-line">復習した問題の<strong>次回復習日</strong>は自動更新されました</p>`
    : `<p class="result-line">習熟レベル：<span class="mastery-badge" style="background:${m.color}">${m.label}</span></p>
       <p class="result-line">${medal ? medal.emoji + " " + medal.label + " 獲得！" : "全問正解で銀メダル"}</p>`;
  const ringColor = isReview ? "#2f6fed" : m.color;

  const actions = isReview
    ? `${retryBtn}<button class="btn primary" data-nav="review" type="button">復習センターへ</button>
       <button class="btn" data-nav="home" type="button">ホームへ</button>`
    : `${retryBtn}<button class="btn primary" data-retry="${session.unitId}" type="button">もう一度演習する</button>
       <button class="btn" data-go-stage="${stage.id}" type="button">${stage.stage}の単元一覧へ</button>`;

  // 間違い直し用に wrong items を保持
  const wrongItems = session.results.filter((r) => !r.correct).map((r) => r.item);
  pendingRetryItems = wrongItems;

  app.innerHTML = `
    <section class="wrap narrow">
      <div class="panel result-panel">
        ${headerHtml}
        <div class="result-score" style="--c:${ringColor}">
          <div class="result-ring" style="--p:${score}"><span>${score}<small>%</small></span></div>
          <div class="result-meta">
            <p class="result-line">正解 <strong>${session.correct} / ${total}</strong></p>
            <p class="result-line">所要時間 <strong>${fmtTime(elapsed)}</strong></p>
            ${masteryLine}
          </div>
        </div>
        ${
          isPerfect
            ? `<p class="result-congrats">🎉 全問正解！この調子で続けましょう。</p>`
            : `<p class="result-note">間違えた問題・「わからない」とした問題は、復習センターと習熟状況で復習できます。</p>`
        }
        <ul class="result-review">${reviewHtml}</ul>
        <div class="result-actions">${actions}</div>
      </div>
    </section>`;
  session = null;
  renderStreak();
}
let pendingRetryItems = [];

/* ---------- 習熟状況 ---------- */
function renderStatus() {
  const stagesHtml = CURRICULUM.map((stage) => {
    const p = stageProgress(stage);
    const pct = Math.round((p.passed / p.total) * 100);
    const rows = sortedUnits(stage)
      .map((u) => {
        const mm = masteryOf(u.id);
        const medal = medalOf(u.id);
        const st = progress.units[u.id];
        const g = gradeOf(u.id);
        return `
        <button class="status-row" data-go-unit="${u.id}" type="button">
          <span class="status-title">${u.title} ${g.label ? `<span class="grade-badge sm">${g.label}</span>` : ""}</span>
          <span class="status-right">
            ${medal ? `<span class="medal">${medal.emoji}</span>` : ""}
            <span class="mastery-badge sm" style="background:${mm.color}">${mm.label}</span>
            <span class="status-score">${st && st.attempts ? st.bestScore + "%" : "—"}</span>
          </span>
        </button>`;
      })
      .join("");
    return `
      <div class="status-stage">
        <div class="status-stage-head" style="--c:${stage.color}">
          <span class="stage-chip" style="background:${stage.color}">${stage.stage}</span>
          <span>合格 ${p.passed}/${p.total} ・ 平均 ${p.avg}%</span>
        </div>
        <div class="bar"><div class="bar-fill" style="width:${pct}%;background:${stage.color}"></div></div>
        <div class="status-rows">${rows}</div>
      </div>`;
  }).join("");

  const weak = [],
    vague = [];
  let learnedCount = 0,
    undecidedCount = 0;
  CURRICULUM.forEach((stage) => {
    stage.units.forEach((u) => {
      u.exercises.forEach((ex, idx) => {
        const s = problemStatus(u.id, idx);
        const q = ex.type === "steps" ? ex.main.q : ex.q || ex.sentence;
        const entry = { unitId: u.id, unitTitle: u.title, stage: stage.stage, q };
        if (s === "weak") weak.push(entry);
        else if (s === "vague") vague.push(entry);
        else if (s === "learned") learnedCount++;
        else undecidedCount++;
      });
    });
  });
  const listHtml = (arr, meta) =>
    arr.length
      ? arr
          .map(
            (e) => `
        <button class="recall-item" data-go-unit="${e.unitId}" type="button">
          <span class="recall-dot">${meta.emoji}</span>
          <span class="recall-body">
            <span class="recall-q">${escapeHtml(e.q)}</span>
            <span class="recall-unit">${e.stage}／${e.unitTitle}</span>
          </span>
        </button>`
          )
          .join("")
      : `<p class="recall-empty">該当なし。よくできています！</p>`;

  let medalCount = { silver: 0, gold: 0, shiny: 0 };
  CURRICULUM.forEach((s) =>
    s.units.forEach((u) => {
      const md = medalOf(u.id);
      if (md && medalCount[md.key] !== undefined) medalCount[md.key]++;
    })
  );
  const due = dueProblems().length;

  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-nav="home" type="button">← ホーム</button>
      <h1 class="page-title">習熟状況</h1>
      <div class="status-summary">
        <div class="summary-card"><span class="summary-num">${progress.streak || 0}</span><span>🔥 連続日数</span></div>
        <div class="summary-card"><span class="summary-num">${medalCount.shiny}</span><span>🌟 シャイニー</span></div>
        <div class="summary-card"><span class="summary-num">${medalCount.gold}</span><span>🥇 金メダル</span></div>
        <div class="summary-card"><span class="summary-num">${medalCount.silver}</span><span>🥈 銀メダル</span></div>
        <div class="summary-card"><span class="summary-num">${learnedCount}</span><span>🟢 覚えた</span></div>
        <div class="summary-card"><span class="summary-num">${vague.length}</span><span>🟡 うろ覚え</span></div>
        <div class="summary-card"><span class="summary-num">${weak.length}</span><span>🔴 苦手</span></div>
        <div class="summary-card"><span class="summary-num">${undecidedCount}</span><span>⚪ 未判定</span></div>
      </div>

      ${
        due > 0
          ? `<button class="review-banner" data-nav="review" type="button">🔁 <strong>今日の復習が ${due}問</strong> — 復習センターへ</button>`
          : ""
      }

      <h2 class="section-title">区分・単元ごとの習熟</h2>
      <div class="status-stages">${stagesHtml}</div>

      <h2 class="section-title">🔴 苦手な問題（直近で不正解・わからない）</h2>
      <div class="recall-list">${listHtml(weak, STATUS_META.weak)}</div>

      <h2 class="section-title">🟡 うろ覚えの問題（間違えた経験あり）</h2>
      <div class="recall-list">${listHtml(vague, STATUS_META.vague)}</div>

      <div class="reset-row">
        <button class="btn ghost small" id="resetBtn" type="button">学習データをリセット</button>
      </div>
    </section>`;
}

/* ---------- 音声ボタンの委譲 ---------- */
document.addEventListener("click", (e) => {
  const tts = e.target.closest(".tts-btn");
  if (tts) {
    speak(tts.dataset.speak || "");
    e.stopPropagation();
  }
});

/* ---------- イベント委譲 ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-nav],[data-go-stage],[data-go-unit],[data-step],[data-mode],[data-diag],[data-lecture-done],[data-retry],[data-retry-wrong],[data-review-start],#homeBtn,#resetBtn,#exNext"
  );
  if (!t) return;

  if (t.id === "exNext") {
    if (!session) return;
    session.pos++;
    session.answered = false;
    session.hintUsed = false;
    session.sub = { pos: 0, log: [] };
    return renderExercise();
  }
  if (t.id === "homeBtn") return navigate("home");
  if (t.id === "resetBtn") {
    if (confirm("学習データ（習熟・メダル・記憶度・復習予定・連続日数）をすべて消去します。よろしいですか？")) {
      progress = { studyMode: progress.studyMode, units: {}, problems: {}, streak: 0, lastStudyDate: null };
      saveProgress();
      navigate("status");
    }
    return;
  }
  if (t.dataset.reviewStart) {
    const items = t.dataset.reviewStart === "weak" ? weakProblems() : dueProblems();
    const label = t.dataset.reviewStart === "weak" ? "弱点の復習" : "今日の復習";
    return startCustomSession(items, label);
  }
  if (t.dataset.retryWrong) {
    if (pendingRetryItems && pendingRetryItems.length) {
      return startCustomSession(pendingRetryItems, "間違いだけ再挑戦");
    }
    return;
  }
  if (t.dataset.nav) return navigate(t.dataset.nav);
  if (t.dataset.goStage) return navigate("stage", { stageId: t.dataset.goStage });
  if (t.dataset.goUnit) return navigate("unit", { unitId: t.dataset.goUnit });
  if (t.dataset.retry) {
    session = null;
    return navigate("exercise", { unitId: t.dataset.retry });
  }
  if (t.dataset.mode) {
    progress.studyMode = t.dataset.mode;
    saveProgress();
    return renderHome();
  }
  if (t.dataset.step) {
    if (t.disabled) return;
    return navigate(t.dataset.step, { unitId: route.unitId });
  }
  if (t.dataset.diag) {
    const st = unitState(route.unitId);
    st.diagnosed = true;
    saveProgress();
    return navigate(t.dataset.diag === "ok" ? "exercise" : "lecture", { unitId: route.unitId });
  }
  if (t.dataset.lectureDone) {
    const st = unitState(t.dataset.lectureDone);
    st.lectureDone = true;
    saveProgress();
    return navigate("exercise", { unitId: t.dataset.lectureDone });
  }
});

/* ---------- 起動 ---------- */
render();
