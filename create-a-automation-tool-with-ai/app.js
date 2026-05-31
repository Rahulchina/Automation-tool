const goalInput = document.querySelector("#automation-goal");
const generateButton = document.querySelector("#generate-button");
const simulateButton = document.querySelector("#simulate-button");
const exportButton = document.querySelector("#export-button");
const scheduleSelect = document.querySelector("#schedule-select");
const riskSelect = document.querySelector("#risk-select");
const workflowTitle = document.querySelector("#workflow-title");
const stepCount = document.querySelector("#step-count");
const confidenceScore = document.querySelector("#confidence-score");
const safetyScore = document.querySelector("#safety-score");
const emptyState = document.querySelector("#empty-state");
const stepsList = document.querySelector("#steps-list");
const assistantNotes = document.querySelector("#assistant-notes");
const exportDialog = document.querySelector("#export-dialog");
const exportOutput = document.querySelector("#export-output");
const presetButtons = document.querySelectorAll("[data-preset]");

let currentWorkflow = null;

const presets = {
  support:
    "Every weekday morning, summarize unread support emails, tag urgent ones, and send me a Slack digest.",
  sales:
    "When a new sales lead enters the CRM, enrich it, score it, route qualified prospects, and create follow-up tasks.",
  docs:
    "When a new invoice PDF lands in a folder, extract the vendor, total, due date, and invoice number, then update a tracking sheet."
};

const templates = [
  {
    match: ["email", "inbox", "support", "gmail", "outlook"],
    title: "Inbox triage assistant",
    steps: [
      ["Trigger", "Scan unread messages that match the selected schedule."],
      ["Filter", "Classify messages by topic, sentiment, urgency, and sender importance."],
      ["Review", "Hold any message with legal, billing, or angry-customer language for approval."],
      ["Action", "Apply labels, draft replies, and create follow-up tasks for owners."],
      ["Output", "Send a concise digest with links to the source messages."]
    ],
    notes:
      "This workflow should start in draft mode until the classifier has been checked against real examples."
  },
  {
    match: ["slack", "teams", "message", "chat", "digest"],
    title: "Team message digest",
    steps: [
      ["Trigger", "Collect new channel activity during the schedule window."],
      ["Filter", "Ignore low-signal reactions, greetings, and repeated bot posts."],
      ["Action", "Summarize decisions, blockers, requests, and promised follow-ups."],
      ["Review", "Flag messages that mention customers, security, or deadlines."],
      ["Output", "Post a clean digest to the chosen destination."]
    ],
    notes:
      "Add channel allowlists before connecting this to production workspaces."
  },
  {
    match: ["lead", "crm", "sales", "customer", "prospect"],
    title: "Lead enrichment workflow",
    steps: [
      ["Trigger", "Watch for new leads entering the CRM."],
      ["Action", "Normalize company, role, geography, source, and deal-size fields."],
      ["Action", "Research public company context and infer the best segment."],
      ["Review", "Ask for approval before overwriting existing owner or revenue data."],
      ["Output", "Create next-step tasks and route qualified leads to the right queue."]
    ],
    notes:
      "Keep human approval on field updates that affect forecasting or ownership."
  },
  {
    match: ["file", "folder", "pdf", "document", "invoice", "receipt"],
    title: "Document processing line",
    steps: [
      ["Trigger", "Watch the target folder for new documents."],
      ["Action", "Extract text, document type, dates, totals, names, and reference IDs."],
      ["Filter", "Reject duplicates and files with missing required fields."],
      ["Review", "Route uncertain extractions to a manual check queue."],
      ["Output", "Rename, archive, and update the tracking sheet or database."]
    ],
    notes:
      "Use confidence thresholds per field, not only one document-level score."
  }
];

const fallbackTemplate = {
  title: "Custom automation workflow",
  steps: [
    ["Trigger", "Start from the schedule, webhook, form submission, or manual launch point."],
    ["Gather", "Collect all records, files, messages, and context needed for the task."],
    ["Decide", "Use AI to classify the work and choose the safest next action."],
    ["Review", "Pause before irreversible changes, external sends, or data overwrites."],
    ["Action", "Complete the approved steps and log what changed."],
    ["Output", "Send a summary with results, skipped items, and follow-up needs."]
  ],
  notes:
    "The prompt is broad, so the workflow includes stronger checkpoints and a reusable audit trail."
};

function buildWorkflow(goal) {
  const normalizedGoal = goal.toLowerCase();
  const chosen =
    templates.find((template) =>
      template.match.some((keyword) => normalizedGoal.includes(keyword))
    ) || fallbackTemplate;

  const riskMode = riskSelect.value;
  const schedule = scheduleSelect.value;
  const approvalRequired =
    riskMode.includes("Ask") || riskMode.includes("Draft") || normalizedGoal.includes("send");

  const steps = chosen.steps.map(([type, detail], index) => ({
    id: index + 1,
    type,
    detail,
    status: type === "Review" || approvalRequired ? "Needs guardrail" : "Ready"
  }));

  return {
    name: chosen.title,
    goal,
    schedule,
    approvalMode: riskMode,
    confidence: chosen === fallbackTemplate ? 72 : 86,
    safety: approvalRequired ? "Guarded" : "Standard",
    steps,
    assistantNotes: [
      chosen.notes,
      `Schedule selected: ${schedule}.`,
      approvalRequired
        ? "External actions should wait for approval until test runs look clean."
        : "This can start with low-risk dry runs and move to auto-run after validation."
    ]
  };
}

function renderWorkflow(workflow) {
  currentWorkflow = workflow;
  workflowTitle.textContent = workflow.name;
  stepCount.textContent = workflow.steps.length;
  confidenceScore.textContent = `${workflow.confidence}%`;
  safetyScore.textContent = workflow.safety;
  emptyState.hidden = true;
  stepsList.innerHTML = "";

  workflow.steps.forEach((step) => {
    const item = document.createElement("li");
    const badgeClass =
      step.type === "Review" ? "review" : step.type === "Output" ? "output" : "";
    item.className = "step";
    item.innerHTML = `
      <span class="step-index">${step.id}</span>
      <div>
        <h3>${step.type}</h3>
        <p>${step.detail}</p>
      </div>
      <span class="badge ${badgeClass}">${step.status}</span>
    `;
    stepsList.append(item);
  });

  assistantNotes.innerHTML = workflow.assistantNotes
    .map((note, index) =>
      index === 0 ? `<p><strong>Recommendation:</strong> ${note}</p>` : `<p>${note}</p>`
    )
    .join("");

  simulateButton.disabled = false;
  exportButton.disabled = false;
}

function simulateRun() {
  if (!currentWorkflow) return;

  const testedSteps = currentWorkflow.steps.map((step) => ({
    ...step,
    status: step.type === "Review" ? "Approval gate" : "Simulated"
  }));

  renderWorkflow({
    ...currentWorkflow,
    confidence: Math.min(currentWorkflow.confidence + 4, 96),
    assistantNotes: [
      "Simulation completed with no blocking conflicts.",
      "Next practical step: connect one real input source and run this against a small sample.",
      "Keep approvals enabled until the audit log matches expected behavior."
    ],
    steps: testedSteps
  });
}

generateButton.addEventListener("click", () => {
  const goal = goalInput.value.trim();

  if (!goal) {
    goalInput.focus();
    goalInput.placeholder = "Start with the repetitive task you want automated.";
    return;
  }

  renderWorkflow(buildWorkflow(goal));
});

simulateButton.addEventListener("click", simulateRun);

exportButton.addEventListener("click", () => {
  if (!currentWorkflow) return;

  exportOutput.textContent = JSON.stringify(currentWorkflow, null, 2);
  exportDialog.showModal();
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];

    if (!preset) return;

    goalInput.value = preset;
    renderWorkflow(buildWorkflow(preset));
  });
});

goalInput.value =
  "Every weekday morning, summarize unread support emails, tag urgent ones, and send me a Slack digest.";
