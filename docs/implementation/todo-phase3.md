### Phase 3: Advanced Configuration (SHOULD HAVE - MVP)

**Priority:** Nice to have, adds polish

- [ ] Auto round scheduling (Scenario 25)
  - Parse "Auto Round Scheduling" config (immediate, X days, X hours)
  - Schedule next round launch after delay
  - Post announcement when round completes
  - Post announcement when next round starts
  - Handle manual override (cancel scheduled launch)
  - Handle pause interaction (suspend countdown)
  - **NOTE:** Scheduling lost on bot restart (documented risk)
- [ ] Thread/channel organization support (Scenario 30 - manual setup)
  - Admin pre-creates Discord channels and threads
  - Bot validates channel IDs during tournament creation
  - Bot posts to configured channels/threads
  - **NOTE:** Auto-creation of channels/threads is deferred (see FUTURE.md)

