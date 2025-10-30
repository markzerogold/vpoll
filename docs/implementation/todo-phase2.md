### Phase 2: Admin Controls (MUST HAVE - MVP)

**Priority:** Essential for tournament management

- [ ] `/tournament pause` - Scenario 18
  - Update tournament status to "paused"
  - Suspend auto-scheduling (if enabled)
  - Block manual next-round commands
  - Active polls continue and complete normally
- [ ] `/tournament resume` - Scenario 18
  - Update tournament status to "active"
  - Re-enable auto-scheduling (if configured)
  - Allow manual commands again
- [ ] `/tournament cancel` - Scenario 19
  - Confirm with admin (destructive action)
  - Close all active polls immediately
  - Process current results
  - Update status to "canceled"
  - Post cancellation announcement
  - Preserve data (don't delete)
- [ ] `/tournament results` - Scenario 15 (text summary)
  - Display current round status
  - Show active/completed matches per region
  - Show recent results (last 3-5 matches)
  - Link to Google Sheets
- [ ] `/tournament bracket` - Scenario 15 (sheets link)
  - Return Google Sheets URL
  - Simple command, just post link
- [ ] `/tournament winner` - Scenario 16 (manual winner post)
  - Check tournament status (must be "completed")
  - Generate same announcement as Scenario 14
  - Allow re-posting winner

