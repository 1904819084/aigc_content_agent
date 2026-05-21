# [OPEN] debug-task-status-failed

## Problem
- Task `_id`: `task_1779333147885`
- Symptom: task top-level status shows `failed`, while the stage list screenshot indicates `image_prompt_generating` and `video_prompt_generating` are already `completed`.
- Goal: determine whether this is backend state inconsistency, failed downstream transition, or frontend stale data.

## Hypotheses
1. A downstream stage or task-level failure path set `task.status = failed` after prompt-generation stages completed.
2. `currentStage` was not updated correctly after a failure, so the UI still points at `video_prompt_generating`.
3. DAG concurrent writes caused top-level task fields and `stages[]` item fields to diverge.
4. The frontend is showing mixed snapshots from separate fetches or stale local state.

## Evidence Plan
- Read the Mongo task document for `_id = task_1779333147885`
- Inspect task outputs and per-stage error fields
- Cross-check backend logs if needed
- Inspect task status update paths only after runtime evidence is clear
