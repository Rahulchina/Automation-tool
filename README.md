# FlowForge AI

A small browser-based automation builder with an AI-assisted workflow planner.

## Use

Open `index.html` in a browser, describe the repetitive task, then generate a workflow. The app creates:

- Trigger, filter, action, review, and output steps
- Schedule and approval-mode metadata
- Assistant recommendations
- Simulation status
- Exportable workflow JSON

## Notes

The current AI assist runs locally with intent templates, so it works without accounts or dependencies. A future API-backed model can replace `buildWorkflow()` in `app.js` while keeping the same workflow shape.

## Visual Assets

The hero illustration lives at `assets/automation-dashboard.png`. It can be regenerated with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\generate-assets.ps1
```
