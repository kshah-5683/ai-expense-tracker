# Step-by-Step Guide to Deploy on Netlify

This is the secure, professional way to host your app in a public repository. We will use Netlify to host both the website (`index.html`) and the secure API function.

### Step 1: Set Up Your GitHub Repository

1.  Create a **new public repository** on GitHub (e.g., `ai-expense-tracker`).
2.  In the root of the repo, add your main file:
    * **File:** `ai-expense-tracker.html` (or rename it `index.html`)
3.  Create the `netlify.toml` file in the root:
    * **File:** `netlify.toml`
4.  Create the folder and file for your secure function:
    * **Folder:** `netlify/functions/`
    * **File:** `getExpenses.js` (place this *inside* the `netlify/functions` folder).
5.  Commit and push these 3 files (`ai-expense-tracker.html`, `netlify.toml`, and `netlify/functions/getExpenses.js`) to your public GitHub repo.

Your repo structure should look like this:
/ |-- ai-expense-tracker.html |-- netlify.toml -- netlify/ -- functions/ `-- getExpenses.js 

### Step 2: Create & Configure Your Netlify Site

1.  Go to [Netlify](https://app.netlify.com/) and sign up (you can use your GitHub account).
2.  On your dashboard, click **"Add new site" > "Import an existing project"**.
3.  Choose **"GitHub"** and authorize it to see your repositories.
4.  Select your new `ai-expense-tracker` repository.
5.  Netlify will auto-detect your `netlify.toml` file. The build settings should be fine. Just click **"Deploy site"**.

### Step 3: Add Your Secret API Key (The Most Important Step)

Once your site is created, you must add your Gemini API key as a secure "environment variable."

1.  On your new site's dashboard in Netlify, go to **"Site settings"**.
2.  Go to **"Build & deploy" > "Environment"**.
3.  Click **"Edit variables"**.
4.  Add a new variable:
    * **Key:** `GEMINI_API_KEY`
    * **Value:** `AIzaSy...` (Paste your **secret Gemini API key** here).
5.  Click **"Save"**.

### Step 4: Re-deploy and Finish

1.  To make your new environment variable active, you need to re-deploy your site.
2.  Go to the **"Deploys"** tab for your site.
3.  Click **"Trigger deploy" > "Deploy site"**.
4.  Wait a minute for it to build.

That's it! Your site is now live on the free Netlify URL (e.g., `your-site-name.netlify.app`). Your `index.html` file is public, but your Gemini API key is completely secure on Netlify's servers.

You can now add your custom domain in the **"Domain settings"** tab on Netlify.
