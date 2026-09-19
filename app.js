const STAGE_CLASS = {
  "01_클라우드인프라전환": "s-infra",
  "02_컨테이너PaaS및운영플랫폼구축": "s-paas",
  "03_MSA애플리케이션전환": "s-msa",
  "04_데이터전환": "s-data",
  "05_테스트및품질검증": "s-test",
  "06_보안전환": "s-sec",
  "07_전환지원및안정화": "s-stabil",
  "관리산출물(별도)": "s-mgmt",
};

const ABBR = [
  ["ECR", "Equipment Configuration Requirement", "시스템 장비 구성 요구사항"],
  ["CTR", "Cloud Transition Requirement", "클라우드 전환 요구사항"],
  ["CSR", "Cloud Service Requirement", "클라우드 서비스 요구사항"],
  ["SFR", "Software Functional Requirement", "기능 요구사항"],
  ["PER", "Performance Requirement", "성능 요구사항"],
  ["SIR", "System Interface Requirement", "인터페이스 요구사항"],
  ["DAR", "Data Requirement", "데이터 요구사항"],
  ["TER", "Test Requirement", "테스트 요구사항"],
  ["QUR", "Quality Requirement", "품질요구사항"],
  ["PSR", "Project Support Requirement", "프로젝트 지원 요구사항"],
  ["PMR", "Project Management Requirement", "프로젝트 관리 요구사항"],
  ["SER", "Security Requirement", "보안 요구사항"],
  ["COR", "Constraint Requirement", "제약사항"],
];

let ROWS = [];
let sortKey = "rfp";
let sortDir = 1;

const $ = (id) => document.getElementById(id);

function stageClass(stage) {
  return STAGE_CLASS[stage] || "s-na";
}

function render() {
  const q = $("search").value.trim().toLowerCase();
  const stage = $("stage-filter").value;

  let rows = ROWS.filter((r) => {
    if (stage && r.stage !== stage) return false;
    if (!q) return true;
    return [r.rfp, r.title, r.summary, r.deliverables, r.stage]
      .join(" ").toLowerCase().includes(q);
  });

  rows.sort((a, b) => {
    const av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
    return av < bv ? -sortDir : av > bv ? sortDir : 0;
  });

  $("count").textContent = `${rows.length} / ${ROWS.length}건`;
  $("tbody").innerHTML = rows.map((r) => `
    <tr>
      <td class="col-rfp">${r.rfp}</td>
      <td class="col-req">
        <p class="req-title">${r.title}</p>
        <p class="req-summary">${r.summary}</p>
      </td>
      <td class="col-out">${r.deliverables.replace(/;\s*/g, "<br>")}</td>
      <td class="col-stage"><span class="badge ${stageClass(r.stage)}">${r.stage}</span></td>
    </tr>`).join("");
}

async function boot() {
  ROWS = await (await fetch("data.json")).json();

  const stages = [...new Set(ROWS.map((r) => r.stage))].sort();
  $("stage-filter").innerHTML =
    `<option value="">단계 전체</option>` +
    stages.map((s) => `<option value="${s}">${s}</option>`).join("");

  $("search").addEventListener("input", render);
  $("stage-filter").addEventListener("change", render);
  document.querySelectorAll("thead th").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      sortDir = sortKey === key ? -sortDir : 1;
      sortKey = key;
      render();
    });
  });

  document.querySelector("#abbr-table tbody").innerHTML = ABBR.map(
    ([code, en, ko]) => `<tr><td>${code}</td><td>${en}</td><td>${ko}</td></tr>`
  ).join("");
  const modal = $("abbr-modal");
  $("abbr-btn").addEventListener("click", () => modal.showModal());
  $("abbr-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  render();
}

boot();
