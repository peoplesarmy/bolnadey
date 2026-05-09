# 🚀 How to Deploy Bolna Dey (Simple Guide)

## You need 3 free accounts:
1. **GitHub** — github.com (stores your code)
2. **MongoDB Atlas** — mongodb.com/atlas (your database)
3. **Vercel** — vercel.com (hosts your website)

---

## STEP 1 — Create your free database (MongoDB Atlas)

1. Go to **mongodb.com/atlas** → click "Try Free"
2. Sign up with Google or email
3. Click **Create** → choose **M0 Free** → pick **Singapore** region → click **Create Deployment**
4. Create a database user:
   - Username: `bolnadey`
   - Password: something you'll remember (e.g. `Nepal@2025`)
   - Click **Create Database User**
5. Under **Network Access** → Add IP Address → choose **Allow Access From Anywhere** → Confirm
6. Click **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://bolnadey:Nepal@2025@cluster0.abc12.mongodb.net/
```

Add `/bolna-dey` before the `?` so it becomes:
```
mongodb+srv://bolnadey:Nepal@2025@cluster0.abc12.mongodb.net/bolna-dey?retryWrites=true&w=majority
```

Save this — you will need it in Step 3.

---

## STEP 2 — Upload your files to GitHub

1. Go to **github.com** → Sign up for free
2. Click the **+** button (top right) → **New repository**
3. Name it: `bolna-dey`
4. Click **Create repository**
5. On the next page, click **uploading an existing file**
6. Unzip the `bolna-dey-complete.zip` file on your computer
7. Drag ALL the files from inside the folder into GitHub
8. ⚠️ Do NOT upload the `.env.local` file (it has your passwords)
9. Click **Commit changes**

---

## STEP 3 — Deploy on Vercel

1. Go to **vercel.com** → Sign up with GitHub
2. Click **Add New Project**
3. Find your `bolna-dey` repository → click **Import**
4. Scroll down to **Environment Variables** and add these one by one:

| Name | Value |
|------|-------|
| `MONGODB_URI` | your mongodb+srv://... string from Step 1 |
| `NEXTAUTH_URL` | leave blank for now (fill after first deploy) |
| `NEXTAUTH_SECRET` | type any random 32+ characters |
| `SEED_SECRET` | type any random word |

5. Click **Deploy** — wait 2-3 minutes
6. Once deployed, copy your URL (e.g. `https://bolna-dey.vercel.app`)
7. Go back to Vercel → **Settings** → **Environment Variables** → update `NEXTAUTH_URL` with your real URL
8. Click **Redeploy**

---

## STEP 4 — Add sample data to your database

Open your browser and go to:
```
https://your-app-name.vercel.app/api/seed?secret=your-seed-secret
```

Replace `your-app-name` and `your-seed-secret` with your actual values.

---

## Login after seeding:

| Role | Email | Password | Admin PIN |
|------|-------|----------|-----------|
| Super Admin | superadmin@bolnadey.np | SuperAdmin@2025 | 123456 |
| Senior Editor | editor@bolnadey.np | Editor@2025 | 654321 |
| Reporter | raj@bolnadey.np | Reporter@2025 | — |
| Reader | reader@bolnadey.np | Reader@2025 | — |

---

## ❓ Stuck? Common fixes:

**Site loads but login doesn't work:**
→ Make sure `NEXTAUTH_URL` is set to your correct Vercel URL

**Database error:**
→ In MongoDB Atlas, check Network Access → make sure "Allow from anywhere" is set

**Build failed on Vercel:**
→ Check that all environment variables are filled in correctly
