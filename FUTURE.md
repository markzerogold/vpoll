# vPoll Future Features

This file tracks potential features for future versions of vPoll.

## Tournament Management

### Reseeding Option
Config setting to support reseeding after each round (like NCAA tournament where #1 seed always plays lowest remaining seed) instead of following the original bracket matchups. This would require more complex bracket logic and sheet formulas.

## Statistics & Analytics

### Historical Stats
Track statistics across multiple tournaments: most votes received, win percentages, closest matches, biggest upsets (lower seed beating higher seed). Would require a database or additional sheet to store historical data across tournaments, plus more complex tracking logic.

## Multi-Tournament Support

### Multiple Concurrent Tournaments
Support running multiple tournaments simultaneously in different channels on the same server. Would require tournament ID/name to distinguish them, channel-based or tournament-name-based commands, and tracking multiple tournament states concurrently.

## User Engagement Features

### Advanced User Notification Subscriptions (Scenario 27)
**Current State:** Scenario 27 describes users subscribing to "tournaments they're following" which implies multi-tournament support.

**Future Enhancement:** Full-featured notification system allowing users to:
- Subscribe to multiple tournaments across different servers (public bot)
- Receive DM notifications when new polls go live
- Customize notification preferences per tournament
- View history of tournaments they've participated in

**For MVP:** Simplify to basic tournament announcements in-channel only, or simple "subscribe to this tournament" for single-tournament private bot use. Full cross-tournament subscription system deferred until public bot deployment.

