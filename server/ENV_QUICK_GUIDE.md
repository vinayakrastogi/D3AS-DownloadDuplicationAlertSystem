# Quick .env Setup Guide

## Quick Answer: Where to Get Each Value

### 1. PORT
**Value:** `5000` (or any free port number)
- Just use `5000` - it's the default
- If port 5000 is busy, use `5001`, `5002`, etc.

### 2. MONGODB_URI
**For Local MongoDB (Easiest):**
```env
MONGODB_URI=mongodb://localhost:27017/d3as
```

**To Install MongoDB Locally:**
- **Mac:** `brew install mongodb-community` then `brew services start mongodb-community`
- **Windows:** Download from https://www.mongodb.com/try/download/community
- **Linux:** `sudo apt-get install mongodb` (Ubuntu/Debian)

**For MongoDB Atlas (Cloud - Free):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster → Connect → Copy connection string
4. Replace `<password>` with your password
5. Use: `mongodb+srv://username:password@cluster.mongodb.net/d3as`

### 3. SESSION_SECRET
**Generate a random string:**

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```


## Easy Setup (3 Steps)

### Step 1: Create .env file
```bash
cd server
touch .env
```

### Step 2: Copy this into .env file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/d3as
SESSION_SECRET=generated-secret-key
```

### Step 3: Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongosh
# If it connects, you're good! Type 'exit' to quit
```

**That's it!** Now run `npm start`

---

## Or Use the Setup Script

```bash
cd server
./setup-env.sh
```

This script will guide you through creating the .env file interactively.

---

## Still Need Help?

See `ENV_SETUP.md` for detailed explanations of each variable.
