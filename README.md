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
