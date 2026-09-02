---
id: how-to-set-up-git
title: 'How to set up Git'
sidebar_label: 'How to set up Git'
---

This document guides you through downloading, installing, and configuring **Git** and **Fork** (our recommended Git GUI client), setting up your **GitLab** account, and understanding essential concepts like `.gitignore` and working with Unity projects.

## General Team Guidelines & Rules

Before setting up your environment, please make sure to follow these essential team rules:

1. **Agreed Unity Version:** Always use the exact Unity version designated for the project. Never upgrade or change the project's Unity version on your own.
2. **Individual Credentials:** Everyone must use their own personal credentials (GitLab account, Personal Access Token, IDE licenses). Never use or share credentials with another team member.
3. **When in Doubt, Ask:** If you are unsure about any procedure, Git status, or conflict, **do not guess**—reach out to your Team Lead immediately for guidance.

---

## 1. Introduction to Git

Git is a version control system that tracks changes in your project over time, allowing multiple developers to collaborate smoothly without overwriting each other's work.

* **Recommended Video Resource:** [Git Tutorial For Dummies](https://www.youtube.com/watch?v=mJ-qvsxPHpY)  
  *Watch this video for a beginner-friendly overview of how Git works, including commits, branches, and remotes.*

---

## 2. Download & Install Git

1. **Download:** Go to the official Git website at [git-scm.com](https://git-scm.com/) and download the installer.
2. **Installation Instructions:**
   * Run the installer executable (`.exe` on Windows).
   * Follow the setup wizard defaults.
   * Ensure **"Git from the command line and also from 3rd-party software"** is selected.
   * Keep **Vim** as the **default editor** when prompted to choose.
   * Keep default options for line endings (*Checkout Windows-style, commit Unix-style* on Windows).
3. **Video Guide:** [How to install Git on Windows 11](https://www.youtube.com/watch?v=t2-l3WvWvqg)

---

## 3. Create GitLab Personal Access Token (PAT)

Before configuring your Git client, you need to generate an authentication token in GitLab. This token replaces your regular password for secure Git operations (regular password cannot be used).

1. Log into your **GitLab** account.
	 URL: https://git.cie-group.cz/
2. Click your profile picture in the top-right corner → select **Edit profile** (or **Preferences**).
3. In the left menu, select **Access Tokens**.
4. Click **Add new token**:
   * **Token Name:** `"REPLACE_THIS_WITH_YOUR_SURNAME"_PAT`
   * **Expiration Date:** leave blank.
   * **Select Scopes:** Check `read_repository`, `write_repository`, and `api`.
5. Click **Create personal access token**.
>**IMPORTANT:** Copy the generated token immediately and save it in a secure location (e.g., password manager). *You will not be able to view it again!*

---

## 4. Download & Setup Fork (Git GUI Client)

While Git can be used via command line, we use **Fork** as our visual Git client for daily workflows and Unity project management.

1. **Download Fork:** Visit [fork.dev](https://fork.dev/) and download the installer.
2. **License Prompt Notice:**
   * During or after installation, Fork may prompt you regarding a license.
   * **You can safely ignore or skip this prompt.** Fork offers an unlimited evaluation period with full functionality.
3. **Configuring Git Identity:**
   * In Fork settings (`File` → `Settings` → **Git** tab), set your **Name** and **Work Email** (should match your GitLab email).
1. **Connect GitLab Account (Using PAT):**
   * Open Fork and go to **File** → **Accounts...** (or `Ctrl + Shift + A` / `Cmd + ,` → Accounts).
   * Click **Add Account** and select **GitLab Server**.
<img src="/img/vault/Pasted%20image%2020260728112546.png" alt="Pasted image 20260728112546" width="661" />
- Fill the Server adress: https://git.cie-group.cz/
![Pasted image 20260728112709](/img/vault/Pasted%20image%2020260728112709.png)
   * Paste your **Personal Access Token (PAT)** created in Step 2.
   * Fork will authenticate and securely store your credentials globally.
5. **Setting Default Project Directory:**
   * Set the default folder path where your Unity projects will be stored locally (e.g., `C:\Projects\Unity\` or `~/Projects/Unity/`).

>**Tip**: Keep project paths clean, short, and free of special characters or spaces.

---

## 5. Understanding `.gitignore`

### What is `.gitignore`?
A `.gitignore` file is a configuration file placed in the root of a Git repository. It tells Git which files, folders, and build artifacts to ignore so they are not tracked or committed to the project.

### Why is it critical (especially for Unity)?
Unity and development tools automatically generate thousands of temporary files, local caches, and user-specific IDE settings (such as `Library/`, `Temp/`, `Logs/`, `.csproj` files), often growing up to multiple GBs per project.

* **Without `.gitignore`:** Generated temporary files will clutter commit history, cause continuous merge conflicts, and bloat repository storage.
* **With `.gitignore`:** Git tracks only essential source code, assets, `.meta` files, and project configurations.

### Our Standardized `.gitignore`
In our company, **we use a standardized `.gitignore` file** tailored specifically to our project stack and Unity workflow to ensure consistency across all repositories.

* **Where to find it:** The standard `.gitignore` is automatically included in our repository templates. When setting up a new project, always ensure this standardized file is copied into your repository root.
* **Rule:** Do not modify the shared `.gitignore` rules without consulting **Michal Kulhánek**.


# Fork manual

<img src="/img/vault/Pasted%20image%2020260728122641.png" alt="Pasted image 20260728122641" width="697" />

![Pasted image 20260728124341](/img/vault/Pasted%20image%2020260728124341.png)
## Cloning Your First Repository

With your account linked, cloning repositories is fully automated:

1. Copy the HTTPS clone URL of your repository from GitLab.
	![Pasted image 20260728132037](/img/vault/Pasted%20image%2020260728132037.png)
2. In Fork, click **File** → **Clone** (`Ctrl + N` / `Cmd + N`).
3. Paste the URL into the **Repository URL** field.
4. Choose your local destination path (e.g., inside your Unity projects folder).
5. Click **Clone**.
   *(Fork will automatically use your saved GitLab PAT, so no extra authentication prompts will appear.)*
	![Pasted image 20260728115912](/img/vault/Pasted%20image%2020260728115912.png)
---
## Fetching Remote Changes (Check for Updates)
**What it does:** Fetch checks the remote server (GitLab) to see if there are new commits, without altering your local files or work directory.

**When to use:** Start your workday or task by fetching to see if any updates are waiting.

**How to do it in Fork:**
1. Click the **Fetch** button in the top toolbar (or press `Ctrl + Shift + F` / `Cmd + Shift + F`).
	![Pasted image 20260728131929](/img/vault/Pasted%20image%2020260728131929.png)
2. A status popup will brief you on remote progress.
3. If new commits exist on GitLab, Fork will display an indicator icon next to your remote branch in the left sidebar (e.g., `origin/main 🡓 2` meaning 2 commits behind).

![Pasted image 20260728123846](/img/vault/Pasted%20image%2020260728123846.png)

---

### Pulling Changes (Downloading Updates)

**What it does:** Pull downloads new commits from GitLab and updates your local working directory with the latest project files.

**When to use:** Before beginning new work or after fetching when you see new incoming commits on the remote branch.

**How to do it in Fork:**
1. Click the **Pull** button in the top toolbar (or press `Ctrl + Shift + P` / `Cmd + Shift + P`).
	![Pasted image 20260728132151](/img/vault/Pasted%20image%2020260728132151.png)
2. Ensure the correct target branch is selected (e.g., `main`).
3. Keep default settings (*Fast-forward if possible*).
4. Click **Pull**. Your local files are now updated to match the latest GitLab state.

![Pasted image 20260728123902](/img/vault/Pasted%20image%2020260728123902.png)

---

### 3. Committing Local Changes (Saving Progress)

**What it does:** A commit creates a local snapshot of your modified files along with a descriptive message explaining what changed.

**When to use:** Whenever you complete a logical piece of work (e.g., created a new feature, fixed a bug, updated Unity asset configurations).

**How to do it in Fork:**
1. Click **Local Changes** in the left sidebar. You will see a list of modified, added, or deleted files under **Unstaged Changes**.
2. Select the files you want to include in this commit and click **Stage** (or press `Shift` and click **Stage All** to include all modified files).
3. The staged files will move to the **Staged Changes** section.
4. In the bottom right text area, type a clear, descriptive **Commit Message** (e.g., `Add player movement script and updated prefabs`).
5. Click the **Commit X Files** button at the bottom right. Your snapshot is now saved locally!

![Pasted image 20260728124158](/img/vault/Pasted%20image%2020260728124158.png)

---

### 4. Pushing Commits (Uploading to GitLab)

**What it does:** Push uploads your local commits to the GitLab repository so your changes are saved remotely and accessible to the rest of the team or build system.

**When to use:** At the end of a task, before ending your workday, or whenever you want your progress safely backed up on GitLab.

**How to do it in Fork:**
1. Look at the top toolbar or sidebar — you will see an indicator showing how many local commits are ready to push (e.g., `main 🡑 1` meaning 1 commit ahead of remote).
	![Pasted image 20260728132351](/img/vault/Pasted%20image%2020260728132351.png)
2. Click the **Push** button in the top toolbar (or press `Ctrl + P` / `Cmd + P`).
3. Verify the target branch and remote (`origin`).
4. Click **Push**. Once completed, your commits are live on GitLab!

<img src="/img/vault/Pasted%20image%2020260728124307.png" alt="Pasted image 20260728124307" width="697" />

---

*If you encounter any issues during your daily workflow, please reach out to your team lead or tech buddy!*
