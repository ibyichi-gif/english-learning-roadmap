/* =========================================================
   英語習熟トレーナー  アプリ本体（SPA）
   区分 → 学習単元 → 診断/講義/演習。習熟と記憶度を localStorage で管理。
   ========================================================= */

const STORE_KEY = "eng-mastery-trainer-v1";

/* ---------- 進捗データ ---------- */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { studyMode: "detail", units: {}, problems: {} };
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
function unitState(unitId) {
  if (!progress.units[unitId]) {
    progress.units[unitId] = {
      diagnosed: false,
      lectureDone: false,
      bestScore: 0,
      attempts: 0,
      perfectRuns: 0,
    };
  }
  return progress.units[unitId];
}
function masteryOf(unitId) {
  const st = progress.units[unitId];
  if (!st || st.attempts === 0) return MASTERY_LEVELS[0];
  const score = st.bestScore;
  let level = MASTERY_LEVELS[1];
  for (const lv of MASTERY_LEVELS) {
    if (lv.min >= 0 && score >= lv.min) level = lv;
  }
  return level;
}
function medalOf(unitId) {
  const st = progress.units[unitId];
  if (!st) return null;
  for (const m of MEDALS) {
    if (st.perfectRuns >= m.runs) return m;
  }
  return null;
}
function isDueForReview(unitId) {
  const st = progress.units[unitId];
  if (!st || !st.attempts || !st.lastStudied) return false;
  const days = (Date.now() - st.lastStudied) / 86400000;
  return days >= 1;
}
function stageProgress(stage) {
  const total = stage.units.length;
  let passed = 0;
  let scoreSum = 0;
  stage.units.forEach((u) => {
    const m = masteryOf(u.id);
    if (m.key === "passed") passed++;
    const st = progress.units[u.id];
    scoreSum += st ? st.bestScore : 0;
  });
  return { total, passed, avg: Math.round(scoreSum / total) };
}
function problemKey(unitId, idx) {
  return unitId + "::" + idx;
}
function problemStatus(unitId, idx) {
  const p = progress.problems[problemKey(unitId, idx)];
  if (!p) return null;
  if (p.last === "wrong") return "weak";
  if (p.wrongCount > 0) return "vague";
  return "learned";
}
const STATUS_META = {
  weak: { label: "苦手", color: "#dc2626", emoji: "🔴" },
  vague: { label: "うろ覚え", color: "#d97706", emoji: "🟡" },
  learned: { label: "覚えた", color: "#16a34a", emoji: "🟢" },
};

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

/* ---------- ルーティング ---------- */
const app = document.getElementById("app");
let route = { name: "home" };

function navigate(name, params) {
  route = Object.assign({ name }, params || {});
  window.scrollTo(0, 0);
  render();
}

function render() {
  renderGlobalProgress();
  if (route.name === "home") return renderHome();
  if (route.name === "tips") return renderTips();
  if (route.name === "status") return renderStatus();
  if (route.name === "stage") return renderStage(route.stageId);
  if (route.name === "unit") return renderUnit(route.unitId);
  if (route.name === "lecture") return renderLecture(route.unitId);
  if (route.name === "diagnosis") return renderDiagnosis(route.unitId);
  if (route.name === "exercise") return renderExercise(route.unitId);
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
        <div class="stage-card-foot">
          <span>合格 ${p.passed}/${p.total}</span>
          <span>平均習熟 ${p.avg}%</span>
        </div>
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

  app.innerHTML = `
    <section class="hero">
      <div class="wrap">
        <h1>英語を「区分 × 学習単元」で<br />習熟していく学習アプリ</h1>
        <p class="hero-lead">小学生・中学生・高校生の3区分。各学習単元を「診断 → 講義 → 演習」で進め、
        正答率に応じて習熟レベル（初級〜合格）とメダルが上がっていきます。間違えた問題は「苦手・うろ覚え」として記録され、復習できます。</p>
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

/* ---------- 区分（単元一覧） ---------- */
function renderStage(stageId) {
  const stage = getStage(stageId);
  if (!stage) return navigate("home");
  const unitsHtml = stage.units
    .map((u, i) => {
      const m = masteryOf(u.id);
      const medal = medalOf(u.id);
      const st = progress.units[u.id];
      const score = st ? st.bestScore : 0;
      return `
      <button class="unit-row" data-go-unit="${u.id}" type="button">
        <span class="unit-no">${i + 1}</span>
        <span class="unit-main">
          <span class="unit-title">${u.title} ${medal ? `<span class="medal">${medal.emoji}</span>` : ""}</span>
          <span class="unit-goal">${u.goal}</span>
        </span>
        <span class="unit-meta">
          <span class="mastery-badge" style="background:${m.color}">${m.label}</span>
          <span class="unit-score">${st && st.attempts ? score + "%" : "未挑戦"}</span>
        </span>
      </button>`;
    })
    .join("");
  const p = stageProgress(stage);
  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-nav="home" type="button">← ホーム</button>
      <div class="stage-header" style="--c:${stage.color}">
        <span class="stage-chip lg" style="background:${stage.color}">${stage.stage}</span>
        <p>${stage.desc}</p>
        <div class="stage-header-stat">合格 ${p.passed}/${p.total} ・ 平均習熟 ${p.avg}%</div>
      </div>
      <h2 class="section-title">学習単元（上から順に進めるのが基本）</h2>
      <div class="unit-list">${unitsHtml}</div>
    </section>`;
}

/* ---------- 単元トップ（診断/講義/演習） ---------- */
function renderUnit(unitId) {
  const found = getUnit(unitId);
  if (!found) return navigate("home");
  const { unit, stage } = found;
  const st = unitState(unitId);
  const mode = progress.studyMode || "detail";
  const m = masteryOf(unitId);
  const medal = medalOf(unitId);

  const stepCard = (icon, name, desc, done, action, recommended) => `
    <button class="step-card ${done ? "done" : ""} ${recommended ? "recommended" : ""}" data-step="${action}" type="button">
      <span class="step-icon">${icon}</span>
      <span class="step-body">
        <span class="step-name">${name} ${done ? '<span class="step-done">完了</span>' : ""}${
    recommended ? '<span class="step-rec">おすすめ</span>' : ""
  }</span>
        <span class="step-desc">${desc}</span>
      </span>
      <span class="step-arrow">›</span>
    </button>`;

  // おすすめステップの判定
  let rec = "exercise";
  if (mode === "detail") {
    if (!st.diagnosed) rec = "diagnosis";
    else if (!st.lectureDone) rec = "lecture";
    else rec = "exercise";
  } else {
    rec = st.lectureDone ? "exercise" : "lecture";
  }

  const exTotal = unit.exercises.length;
  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-go-stage="${stage.id}" type="button">← ${stage.stage}の単元一覧</button>
      <div class="unit-header" style="--c:${stage.color}">
        <span class="stage-chip" style="background:${stage.color}">${stage.stage}</span>
        <h1>${unit.title} ${medal ? `<span class="medal lg">${medal.emoji}</span>` : ""}</h1>
        <p class="unit-header-goal"><strong>この単元のゴール：</strong>${unit.goal}</p>
        <div class="unit-header-stat">
          <span class="mastery-badge" style="background:${m.color}">習熟：${m.label}</span>
          <span>最高スコア ${st.attempts ? st.bestScore + "%" : "—"}</span>
          <span>挑戦 ${st.attempts}回</span>
          <span>${medal ? medal.label : "メダル未獲得"}</span>
        </div>
      </div>
      <h2 class="section-title">学習ステップ</h2>
      <div class="step-list">
        ${
          mode === "detail"
            ? stepCard("🩺", "診断", "今の理解度をかんたんにチェック。", st.diagnosed, "diagnosis", rec === "diagnosis")
            : ""
        }
        ${stepCard(
          "📘",
          mode === "detail" ? "講義" : "講義（要点）",
          mode === "detail" ? "要点を講義で学ぶ。" : "要点だけ高速チェック。",
          st.lectureDone,
          "lecture",
          rec === "lecture"
        )}
        ${stepCard(
          "✏️",
          "演習",
          `全${exTotal}問。選択・並べ替え・入力・品詞識別で定着を測る。`,
          st.bestScore > 0,
          "exercise",
          rec === "exercise"
        )}
      </div>
      <div class="medal-hint">🥈 1周全問正解で銀メダル ／ 🥇 2周で金メダル ／ 🌟 3周でシャイニーメダル</div>
    </section>`;
}

/* ---------- 診断 ---------- */
function renderDiagnosis(unitId) {
  const { unit, stage } = getUnit(unitId);
  app.innerHTML = `
    <section class="wrap narrow">
      <button class="back-link" data-go-unit="${unitId}" type="button">← ${unit.title}</button>
      <div class="panel">
        <span class="panel-tag">🩺 診断</span>
        <h1>${unit.title}</h1>
        <p class="diag-q">${unit.diagnosis}</p>
        <p class="diag-help">いまの理解度を自己判定してください。どちらを選んでも学習は進められます。</p>
        <div class="diag-btns">
          <button class="btn primary" data-diag="ok" type="button">だいたい分かる → 演習へ</button>
          <button class="btn" data-diag="ng" type="button">あやしい → 講義から</button>
        </div>
      </div>
    </section>`;
}

/* ---------- 講義 ---------- */
function renderLecture(unitId) {
  const { unit, stage } = getUnit(unitId);
  const mode = progress.studyMode || "detail";
  const pointsHtml = unit.lecture
    .map(
      (pt) => `
      <div class="lec-point">
        <h3>${pt.h}</h3>
        ${mode === "detail" ? `<p>${pt.body}</p>` : ""}
      </div>`
    )
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
    unitId,
    items: unit.exercises.map((ex, idx) => ({ ex, idx })),
    pos: 0,
    correct: 0,
    answered: false,
    results: [],
  };
  renderExercise(unitId);
}

function renderExercise(unitId) {
  if (!session || session.unitId !== unitId) {
    return startExercise(unitId);
  }
  const { unit, stage } = getUnit(unitId);
  const total = session.items.length;

  if (session.pos >= total) return renderExerciseResult(unitId);

  const { ex, idx } = session.items[session.pos];
  const pstatus = problemStatus(unitId, idx);
  const statusTag = pstatus
    ? `<span class="pstatus" style="color:${STATUS_META[pstatus].color}">${STATUS_META[pstatus].emoji} ${STATUS_META[pstatus].label}</span>`
    : "";

  let bodyHtml = "";
  if (ex.type === "choice" || ex.type === "pos") {
    const sentence =
      ex.type === "pos"
        ? `<p class="ex-sentence">${escapeHtml(ex.sentence).replace(
            escapeHtml(ex.target),
            `<u>${escapeHtml(ex.target)}</u>`
          )}</p><p class="ex-q">下線部「${escapeHtml(ex.target)}」について答えましょう。</p>`
        : "";
    bodyHtml = `
      ${sentence}
      <p class="ex-q">${escapeHtml(ex.q)}</p>
      <div class="choices">
        ${ex.choices
          .map((c, i) => `<button class="choice-btn" data-choice="${i}" type="button">${escapeHtml(c)}</button>`)
          .join("")}
      </div>`;
  } else if (ex.type === "order") {
    const tokens = shuffle(ex.tokens);
    bodyHtml = `
      <p class="ex-q">${escapeHtml(ex.q)}</p>
      <div class="order-answer" id="orderAnswer" aria-label="解答欄"></div>
      <div class="order-tokens" id="orderTokens">
        ${tokens.map((t) => `<button class="token" data-token="${escapeHtml(t)}" type="button">${escapeHtml(t)}</button>`).join("")}
      </div>
      <div class="order-actions">
        <button class="btn small" id="orderClear" type="button">クリア</button>
        <button class="btn primary small" id="orderCheck" type="button">解答する</button>
      </div>`;
  } else if (ex.type === "input") {
    bodyHtml = `
      <p class="ex-q">${escapeHtml(ex.q)}</p>
      <div class="input-row">
        <input type="text" id="inputAnswer" class="text-input" placeholder="ここに英語で入力" autocomplete="off" />
        <button class="btn primary" id="inputCheck" type="button">解答する</button>
      </div>`;
  }

  const typeLabel = { choice: "選択式", order: "並べ替え式", input: "入力式", pos: "品詞識別" }[ex.type];

  app.innerHTML = `
    <section class="wrap narrow">
      <button class="back-link" data-go-unit="${unitId}" type="button">← 演習をやめる</button>
      <div class="ex-progress">
        <div class="ex-progress-bar"><div style="width:${(session.pos / total) * 100}%"></div></div>
        <span>${session.pos + 1} / ${total}　正解 ${session.correct}</span>
      </div>
      <div class="panel ex-panel">
        <div class="ex-head">
          <span class="ex-type">${typeLabel}</span>
          ${statusTag}
        </div>
        ${bodyHtml}
        <div class="ex-feedback" id="exFeedback" hidden></div>
        <button class="btn primary wide" id="exNext" type="button" hidden>次へ →</button>
      </div>
    </section>`;

  wireExercise(ex, idx);
}

function wireExercise(ex, idx) {
  const feedback = document.getElementById("exFeedback");
  const nextBtn = document.getElementById("exNext");

  function finishAnswer(isCorrect) {
    if (session.answered) return;
    session.answered = true;
    recordProblem(session.unitId, idx, isCorrect);
    if (isCorrect) session.correct++;
    session.results.push({ idx, correct: isCorrect });
    feedback.hidden = false;
    feedback.className = "ex-feedback " + (isCorrect ? "ok" : "ng");
    feedback.innerHTML = `
      <strong>${isCorrect ? "⭕ 正解！" : "❌ 不正解"}</strong>
      <p>${escapeHtml(ex.explain)}</p>`;
    nextBtn.hidden = false;
    nextBtn.focus();
  }

  if (ex.type === "choice" || ex.type === "pos") {
    document.querySelectorAll(".choice-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        if (session.answered) return;
        const correct = i === ex.answer;
        document.querySelectorAll(".choice-btn").forEach((b, bi) => {
          b.disabled = true;
          if (bi === ex.answer) b.classList.add("correct");
          if (bi === i && !correct) b.classList.add("wrong");
        });
        finishAnswer(correct);
      });
    });
  } else if (ex.type === "order") {
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
          const ri = Number(b.dataset.remove);
          const [tok] = picked.splice(ri, 1);
          // トークンを戻す
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
        `<div class="order-result correct-line">正解：${escapeHtml(ex.answer.join(" "))}</div>`;
      finishAnswer(correct);
    });
  } else if (ex.type === "input") {
    const input = document.getElementById("inputAnswer");
    function check() {
      if (session.answered) return;
      const val = input.value.trim();
      const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/[.．。]/g, "").trim();
      const correct = ex.answers.some((a) => norm(a) === norm(val));
      input.disabled = true;
      input.classList.add(correct ? "correct" : "wrong");
      if (!correct) {
        const fb = el(`<p class="input-correct">正解例：${escapeHtml(ex.answers[0])}</p>`);
        input.parentElement.after(fb);
      }
      finishAnswer(correct);
    }
    document.getElementById("inputCheck").addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") check();
    });
    input.focus();
  }

  nextBtn.addEventListener("click", () => {
    session.pos++;
    session.answered = false;
    renderExercise(session.unitId);
  });
}

function recordProblem(unitId, idx, isCorrect) {
  const key = problemKey(unitId, idx);
  const p = progress.problems[key] || { wrongCount: 0, rightCount: 0, last: null };
  if (isCorrect) p.rightCount++;
  else p.wrongCount++;
  p.last = isCorrect ? "right" : "wrong";
  progress.problems[key] = p;
  saveProgress();
}

function renderExerciseResult(unitId) {
  const { unit, stage } = getUnit(unitId);
  const total = session.items.length;
  const score = Math.round((session.correct / total) * 100);
  const st = unitState(unitId);
  st.attempts++;
  if (score > st.bestScore) st.bestScore = score;
  if (session.correct === total) st.perfectRuns++;
  st.lectureDone = st.lectureDone || true;
  st.lastStudied = Date.now();
  saveProgress();

  const m = masteryOf(unitId);
  const medal = medalOf(unitId);
  const isPerfect = session.correct === total;

  const reviewHtml = session.results
    .map((r) => {
      const ex = unit.exercises[r.idx];
      const label = { choice: "選択", order: "並べ替え", input: "入力", pos: "品詞" }[ex.type];
      return `<li class="${r.correct ? "ok" : "ng"}"><span>${r.correct ? "⭕" : "❌"}</span>
        <span class="rev-q">[${label}] ${escapeHtml(ex.q || ex.sentence)}</span></li>`;
    })
    .join("");

  app.innerHTML = `
    <section class="wrap narrow">
      <div class="panel result-panel">
        <span class="panel-tag">✏️ 演習結果</span>
        <h1>${unit.title}</h1>
        <div class="result-score" style="--c:${m.color}">
          <div class="result-ring" style="--p:${score}">
            <span>${score}<small>%</small></span>
          </div>
          <div class="result-meta">
            <p class="result-line">正解 <strong>${session.correct} / ${total}</strong></p>
            <p class="result-line">習熟レベル：<span class="mastery-badge" style="background:${m.color}">${m.label}</span></p>
            <p class="result-line">${medal ? medal.emoji + " " + medal.label + " 獲得！" : "全問正解で銀メダル"}</p>
          </div>
        </div>
        ${
          isPerfect
            ? `<p class="result-congrats">🎉 全問正解！この調子でもう1周すると金メダルです。</p>`
            : `<p class="result-note">間違えた問題は「習熟状況」で復習できます。もう一度挑戦して習熟を上げましょう。</p>`
        }
        <ul class="result-review">${reviewHtml}</ul>
        <div class="result-actions">
          <button class="btn primary" data-retry="${unitId}" type="button">もう一度演習する</button>
          <button class="btn" data-go-stage="${stage.id}" type="button">${stage.stage}の単元一覧へ</button>
        </div>
      </div>
    </section>`;
  session = null;
}

/* ---------- 習熟状況 ---------- */
function renderStatus() {
  const stagesHtml = CURRICULUM.map((stage) => {
    const p = stageProgress(stage);
    const pct = Math.round((p.passed / p.total) * 100);
    const rows = stage.units
      .map((u) => {
        const m = masteryOf(u.id);
        const medal = medalOf(u.id);
        const st = progress.units[u.id];
        return `
        <button class="status-row" data-go-unit="${u.id}" type="button">
          <span class="status-title">${u.title}</span>
          <span class="status-right">
            ${medal ? `<span class="medal">${medal.emoji}</span>` : ""}
            <span class="mastery-badge sm" style="background:${m.color}">${m.label}</span>
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

  // 苦手・うろ覚えリスト
  const weak = [];
  const vague = [];
  CURRICULUM.forEach((stage) => {
    stage.units.forEach((u) => {
      u.exercises.forEach((ex, idx) => {
        const s = problemStatus(u.id, idx);
        const entry = { unitId: u.id, unitTitle: u.title, stage: stage.stage, q: ex.q || ex.sentence, type: ex.type };
        if (s === "weak") weak.push(entry);
        else if (s === "vague") vague.push(entry);
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
  const reviewDue = [];
  CURRICULUM.forEach((s) =>
    s.units.forEach((u) => {
      const md = medalOf(u.id);
      if (md && medalCount[md.key] !== undefined) medalCount[md.key]++;
      if (isDueForReview(u.id)) reviewDue.push({ unitId: u.id, unitTitle: u.title, stage: s.stage });
    })
  );
  const reviewHtml = reviewDue.length
    ? reviewDue
        .map(
          (e) => `
        <button class="recall-item" data-go-unit="${e.unitId}" type="button">
          <span class="recall-dot">🔁</span>
          <span class="recall-body">
            <span class="recall-q">${escapeHtml(e.unitTitle)}</span>
            <span class="recall-unit">${e.stage}／前回の学習から1日以上 — 復習のタイミングです</span>
          </span>
        </button>`
        )
        .join("")
    : `<p class="recall-empty">いまは復習推奨の単元はありません。</p>`;

  app.innerHTML = `
    <section class="wrap">
      <button class="back-link" data-nav="home" type="button">← ホーム</button>
      <h1 class="page-title">習熟状況</h1>
      <div class="status-summary">
        <div class="summary-card"><span class="summary-num">${medalCount.shiny}</span><span>🌟 シャイニー</span></div>
        <div class="summary-card"><span class="summary-num">${medalCount.gold}</span><span>🥇 金メダル</span></div>
        <div class="summary-card"><span class="summary-num">${medalCount.silver}</span><span>🥈 銀メダル</span></div>
        <div class="summary-card"><span class="summary-num">${weak.length}</span><span>🔴 苦手</span></div>
        <div class="summary-card"><span class="summary-num">${vague.length}</span><span>🟡 うろ覚え</span></div>
      </div>

      <h2 class="section-title">🔁 復習推奨の単元</h2>
      <div class="recall-list">${reviewHtml}</div>

      <h2 class="section-title">区分・単元ごとの習熟</h2>
      <div class="status-stages">${stagesHtml}</div>

      <h2 class="section-title">🔴 苦手な問題（直近で不正解）</h2>
      <div class="recall-list">${listHtml(weak, STATUS_META.weak)}</div>

      <h2 class="section-title">🟡 うろ覚えの問題（間違えた経験あり）</h2>
      <div class="recall-list">${listHtml(vague, STATUS_META.vague)}</div>

      <div class="reset-row">
        <button class="btn ghost small" id="resetBtn" type="button">学習データをリセット</button>
      </div>
    </section>`;
}

/* ---------- イベント委譲 ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-nav],[data-go-stage],[data-go-unit],[data-step],[data-mode],[data-diag],[data-lecture-done],[data-retry],#homeBtn,#resetBtn");
  if (!t) return;

  if (t.id === "homeBtn") return navigate("home");
  if (t.id === "resetBtn") {
    if (confirm("学習データ（習熟・メダル・記憶度）をすべて消去します。よろしいですか？")) {
      progress = { studyMode: progress.studyMode, units: {}, problems: {} };
      saveProgress();
      navigate("status");
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
