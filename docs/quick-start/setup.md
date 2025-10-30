# 5-Minute Setup Guide

**Get vPoll running in 5 minutes**

## Prerequisites

- Node.js 18+ installed
- Discord account (to create bot)
- Google Cloud project (for Sheets API)
- Git (to clone repository)

---

## Step 1: Clone & Install (1 min)

```bash
git clone <repository-url>
cd vpoll
npm install
```

---

## Step 2: Discord Bot Setup (2 min)

### Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it "vPoll" (or your choice)
4. Go to **Bot** tab → Click **"Add Bot"**
5. Under **Token**, click **"Copy"** (save for .env file)
6. Go to **General Information** tab → Copy **Application ID** (save for .env file)

### Configure Bot Permissions

1. Go to **Bot** tab
2. Enable these **Privileged Gateway Intents:**
   - ❌ Presence Intent (not needed)
   - ❌ Server Members Intent (not needed)
   - ❌ Message Content Intent (not needed)
3. Under **Bot Permissions**, select:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Use Slash Commands

### Invite Bot to Your Server

1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions (same as above)
4. Copy generated URL
5. Open URL in browser → Select your server → Authorize

---

## Step 3: Google Sheets API Setup (1 min)

### Get Service Account Key

**If you already have `vpoll-key.json`:**
1. Copy it to `vpoll/keys/vpoll-key.json`
2. Skip to Step 4

**If you need to create service account:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google Sheets API**
4. Create **Service Account** with name "vpoll-sheets-access"
5. Create **JSON key** and download
6. Rename to `vpoll-key.json`
7. Move to `vpoll/keys/vpoll-key.json`

**Service account email:** `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`

---

## Step 4: Environment Configuration (30 sec)

```bash
cp .env.example .env
```

Edit `.env` file:

```env
DISCORD_TOKEN=your_bot_token_from_step_2
CLIENT_ID=your_application_id_from_step_2
GUILD_ID=your_server_id_optional
MASTER_TEMPLATE_URL=https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit
```

**Get GUILD_ID (optional, for faster dev deployment):**
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click your server icon → Copy Server ID

---

## Step 5: Build & Deploy (30 sec)

```bash
npm run build
npm run deploy-commands
npm start
```

**Expected output:**
```
[INFO] Loaded command: ping
[INFO] Loaded command: poll
[INFO] Loaded command: tournament
[INFO] Loaded event: ready
Logged in as vPoll#1234!
```

---

## ✅ Verify Setup

In your Discord server, type `/` and you should see:
- `/ping` - Test command
- `/poll` - Create polls
- `/tournament template` - Get tournament template

Test with `/ping` - bot should respond "Pong!" with latency.

---

## 🧪 Test Google Sheets Connection

```bash
npm run test-sheets
```

**Expected output:**
```
✅ Successfully connected to Google Sheets API
✅ Service account authenticated
✅ Can read template structure
```

---

## 🎉 You're Ready!

**Next steps:**
1. **Create tournament:** Get template with `/tournament template`
2. **Read commands:** See [commands.md](commands.md) for all bot commands
3. **Learn workflows:** See [common-tasks.md](common-tasks.md) for dev patterns

---

## ❌ Troubleshooting

### Bot not appearing in server

**Problem:** Invite URL didn't include bot permissions

**Fix:** Regenerate invite URL with correct scopes and permissions (see Step 2)

---

### "Missing DISCORD_TOKEN" error

**Problem:** `.env` file not created or token not set

**Fix:**
```bash
cp .env.example .env
# Edit .env and add your DISCORD_TOKEN
```

---

### "Cannot access spreadsheet" error

**Problem:** Service account key not found or invalid

**Fix:**
1. Check `keys/vpoll-key.json` exists
2. Verify JSON format is valid
3. Ensure service account has Sheets API enabled

---

### Commands not showing in Discord

**Problem:** Commands not deployed

**Fix:**
```bash
npm run deploy-commands
```

Wait 1 minute for global commands, or use `GUILD_ID` in .env for instant guild commands.

---

### "Permission denied" when testing sheets

**Problem:** Service account doesn't have access to sheet

**Fix:**
1. Open Google Sheet
2. Click **Share**
3. Add `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
4. Set permission to **Editor** (not Viewer)
5. Click Send

---

## 📚 Next Steps

- **Create your first tournament:** [../requirements/03-scenarios-setup.md](../requirements/03-scenarios-setup.md)
- **Understand architecture:** [../technical/architecture/overview.md](../technical/architecture/overview.md)
- **See implementation tasks:** [../implementation/todo-phase1.md](../implementation/todo-phase1.md)
