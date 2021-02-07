# sync-test
HTML audio video sync test

# features
- AV sync via FPS-Clock
- AV sync via ping-pong (L/R)
- Channel check (L/R) via alternating ping
- Latency check via TC from server (NTP to be implemented)
- Re-sync (auto) every 2 minutes
- Manual re-sync
- Responsive for Web and Mobile

# settings
- Change FPS: 24, 25, 30, 50, 60
- Audio Out: mute, ping l/r, test tone,LTC (to be implemented)
- View / Change: Time server (NTP)
- View sync status: Online, Offline
- Manual re-sync

# issues
- Set invervall @ js "drops" frames -> double precission (high load?)
- Autoplay audio not allowed -> require user interaction first
- HTML5 audio trigger lag

# workflow
- Local Editor: Visual Studio Code