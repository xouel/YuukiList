# Convergence Report: {{CHANGE_ID}}

- **Verdict:** `{{DIVERGED|CONVERGED}}`
- **State:** `{{OPEN|ADDRESSED|CLOSED}}`
- **Round:** {{ROUND_NUMBER}}
- **Date:** `{{DATE}}`
- **Engine:** `X-Spec Deterministic Engine v2.0.1`

## 1. Audit Scorecard

| Audit Dimension | Status | Details |
| :--- | :--- | :--- |
| **A1. Task Completion** | `{{PASS/FAIL}}` | {{X/Y tasks completed}} |
| **A2a. Deterministic Execution** | `{{PASS/FAIL}}` | {{M/N Traceability Matrix rows with Exec Result == PASS & verified SHA-256 evidence in .xspec/evidence/}} |
| **A2b. Semantic Attestation** | `{{PASS/FAIL}}` | {{K/N Traceability Matrix rows with Code Files, Test Files, and file:line attestation}} |
| **A3. Constitution Compliance** | `{{PASS/FAIL}}` | {{Checked against xspec/constitution.md}} |
| **A4. Verification Commands** | `{{PASS/FAIL/N/A}}` | {{Result of verification.commands via spawnSync (shell: false)}} |
| **A5. Format Validation** | `{{PASS/FAIL}}` | {{Result of xspec validate --stage close}} |
| **A6. Delta Pre-Merge Check** | `{{PASS/FAIL}}` | {{Target existence for MODIFIED/REMOVED/RENAMED and base_specs SHA-256}} |

## 2. Findings & Blocking Items

<!-- Classificação de Gap: `missing` | `partial` | `contradicts` | `unrequested`
     Severidade: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` -->

| ID | Audit | Gap Type | Severity | Source Ref | Evidence (`file:line`) | Remediation Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| B1 | {{A1..A6}} | `{{missing}}` | `{{CRITICAL}}` | {{R:Name / S:Name}} | {{file:line or command output}} | {{Actionable fix}} |
