// 学習フローの描画とモード切り替え

let currentMode = "detail";

function renderStage(stage) {
  const steps = stage.steps
    .map((step) => {
      const items = step[currentMode] || step.detail;
      const tagClass = currentMode === "detail" ? "tag-detail" : "tag-quick";
      const tagLabel = currentMode === "detail" ? "🧱 じっくり" : "⚡ 短期";
      const lis = items.map((t) => `<li>${t}</li>`).join("");
      return `
        <div class="step" style="border-left-color:${stage.color}">
          <span class="step-tag ${tagClass}">${tagLabel}</span>
          <h3>${step.title}</h3>
          <ul>${lis}</ul>
        </div>`;
    })
    .join("");

  const pitfalls = stage.pitfalls.map((p) => `<li>${p}</li>`).join("");

  return `
    <section class="stage fade-in" id="${stage.id}">
      <div class="stage-head">
        <span class="stage-badge" style="background:${stage.color}">${stage.stage}</span>
        <span class="stage-grade">${stage.grade}</span>
      </div>

      <div class="stage-goal">
        <span class="label">この段階のゴール</span>
        <p>${stage.goal}</p>
        <div class="target-grid">
          <div><span class="t-label">語彙の目安</span>${stage.target.words}</div>
          <div><span class="t-label">文法・ルール</span>${stage.target.grammar}</div>
          <div><span class="t-label">技能の重点</span>${stage.target.skills}</div>
        </div>
      </div>

      <div class="steps">${steps}</div>

      <div class="pitfalls">
        <h4>⚠ つまずきポイント</h4>
        <ul>${pitfalls}</ul>
      </div>
    </section>`;
}

function render() {
  const main = document.getElementById("flow");
  main.innerHTML = CURRICULUM.map(renderStage).join("");
  document.getElementById("modeDesc").textContent = MODES[currentMode].desc;
}

function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  render();
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

render();
