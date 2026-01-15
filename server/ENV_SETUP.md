# Environment Variables Setup Guide

This guide explains where to get values for each environment variable in the `.env` file.

## Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/d3as
SESSION_SECRET=your-secret-key-here
```

## Detailed Explanation

### 1. PORT
**What it is:** The port number where your server will run.

**Where to get it:**
- **Default:** `5000` (recommended for development)
- **Custom:** Any available port number (e.g., 3000, 5001, 8000)
- **How to check if port is available:**
  - On Mac/Linux: `lsof -i :5000` (if nothing shows, port is free)
  - On Windows: `netstat -ano | findstr :5000`

**Example:**
```env
PORT=5000
```

---

### 2. MONGODB_URI
**What it is:** The connection string to your MongoDB database.

**Where to get it:**

#### Option A: Local MongoDB (Recommended for Development)
If MongoDB is installed locally:
```env
MONGODB_URI=mongodb://localhost:27017/d3as
```
- `localhost:27017` - Default MongoDB port
- `d3as` - Database name (you can change this to any name)

**To install MongoDB locally:**
- **Mac:** `brew install mongodb-community` or download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Windows:** Download installer from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Linux:** `sudo apt-get install mongodb` (Ubuntu/Debian)

#### Option B: MongoDB Atlas (Cloud - Free Tier Available)
If using MongoDB Atlas (cloud database):
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `d3as` (or your preferred name)

**Example:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/d3as?retryWrites=true&w=majority
```

#### Option C: Docker MongoDB
If using Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```
Then use:
```env
MONGODB_URI=mongodb://localhost:27017/d3as
```

---

### 3. SESSION_SECRET
**What it is:** A secret key used to encrypt session cookies. This should be a random, long string.

**Where to get it:**

#### Option A: Generate a Random String (Recommended)
**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Online Generator:**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" or "Fort Knox Passwords"

**Example:**
```env
SESSION_SECRET=aB3xK9mP2qR7vT5wY8zN1cF4hJ6lM0sD9gH2jK5
```

#### Option B: Use Any Long Random String
You can use any long random string (at least 32 characters recommended):
```env
SESSION_SECRET=my-super-secret-key-change-this-in-production-12345
```

**⚠️ Important:** 
- Never share this secret publicly
- Use different secrets for development and production
- Make it long and random for security

---

## Optional Environment Variables

These have defaults but can be customized:

### CLIENT_URL
**Default:** `http://localhost:3000`
**What it is:** The URL where your React client app runs.

**When to change:**
- If client runs on different port: `CLIENT_URL=http://localhost:3001`
- For production: `CLIENT_URL=https://yourdomain.com`

### ADMIN_URL
**Default:** `http://localhost:3001`
**What it is:** The URL where your React admin panel runs.

**When to change:**
- If admin runs on different port: `ADMIN_URL=http://localhost:3002`
- For production: `ADMIN_URL=https://admin.yourdomain.com`

---

## Complete .env File Example

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/d3as

# Session Security
SESSION_SECRET=aB3xK9mP2qR7vT5wY8zN1cF4hJ6lM0sD9gH2jK5

# Optional: Client URLs (only if different from defaults)
# CLIENT_URL=http://localhost:3000
# ADMIN_URL=http://localhost:3001
```

---

## Quick Setup Steps

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Create .env file:**
   ```bash
   touch .env
   # or on Windows: type nul > .env
   ```

3. **Copy the example above and fill in values:**
   - PORT: Use `5000` (or any free port)
   - MONGODB_URI: Use `mongodb://localhost:27017/d3as` if MongoDB is local
   - SESSION_SECRET: Generate a random string (see methods above)

4. **Save the file**

5. **Verify MongoDB is running:**
   ```bash
   # Check if MongoDB is running
   mongosh  # or mongo (older versions)
   # If it connects, MongoDB is running
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

---

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is installed and running
- Check if MongoDB service is started:
  - Mac: `brew services list` (look for mongodb-community)
  - Windows: Check Services app
  - Linux: `sudo systemctl status mongod`
- Verify the MONGODB_URI is correct

### "Port already in use"
- Change PORT to a different number (e.g., 5001, 5002)
- Or stop the process using that port

### "Session secret is weak"
- Generate a longer, more random string (at least 32 characters)
- Use the openssl command or online generator

---

## Security Notes

- **Never commit .env file to Git** (it's already in .gitignore)
- **Use different secrets for development and production**
- **Keep SESSION_SECRET private** - don't share it publicly
- **For production:** Use environment variables provided by your hosting service (Heroku, AWS, etc.)
