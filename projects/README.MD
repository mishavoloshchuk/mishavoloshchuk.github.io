# Repository copying automatization

## 1 - Create your personal access token
  [Creating a personal access token](https://docs.github.com/en/enterprise-server@3.6/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token)
  > [!IMPORTANT]
  > Check that at least a **repo** scope is selected!

## 2 - Add a secret for your repository

### Method 1: Manual setting secrets
  [Adding secrets for a repository](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-secrets-for-your-repository-and-organization-for-github-codespaces#adding-secrets-for-a-repository)

  > [!NOTE]
  > If you will want to add new repositories you have to save **your personal access token** in some safe and secured place.

### Method 2: Auto update secrets every time you add a new repository (Recommended)
  1. Install (if you haven't) **GitHub's CLI** [Installing manual](https://github.com/cli/cli#installation)
  2. 
```  bash
#!/bin/bash

# REPLACE WITH YOUR VALUES =======================

# Set your GitHub username
USERNAME="mishavoloshchuk"

# Set the secret name
SECRET_NAME="API_TOKEN_GITHUB"

# List of repositories (replace with your repository names)
REPOSITORIES=(
  "Repo1" 
  "Repo2" 
  "Repo3" 
)

# =======================================

# Display inputs
echo "ADD/UPDATE REPOSITORIES' SECRETS"
echo "==================================="
echo "Secret Name: $SECRET_NAME"
echo "GitHub Username: $USERNAME"
echo "Repositories:"
for REPO in "${REPOSITORIES[@]}"
do
  echo "  - $REPO"
done
echo "*You can change the values by editing this file"

# Prompt user for the secret value
read -p "Enter the secret value: " SECRET_VALUE

# Loop through repositories and add the secret
for REPO in "${REPOSITORIES[@]}"
do
  # Set the repository URL
  REPO_URL="https://github.com/$USERNAME/$REPO"

  # Add the secret to the repository
  gh secret set -R "$REPO_URL" "$SECRET_NAME" -b"$SECRET_VALUE"

  # Add a delay (adjust as needed to avoid rate limits)
  sleep 1
done

echo "Secrets added to repositories successfully."

```
  Save the script to a file (e.g., `add_secrets.sh`) and make sure to replace `your_username`, `your_secret_name` and the repository names in the `REPOSITORIES` array with your actual GitHub username, secret name, and repository names.

  3. Double-click the file to execute the srcipt.

  4. Enter **your personal access token**, generated in previous step.

  > [!NOTE]
  > You will have to repeat step **1** and **2.2** every time you need to add a new repository (unless you have stored **your personal access token** in a safe place. In that case, you'll only have to repeat step **2.2** or **2.1**).

## 3 - Create a file
  Create a file  named `.github/workflows/main.yml` in your repository (`main` can be any name of file)

## 4 - Code
  Paste folowing code inside recently created `main.yml` file:
  ``` yaml
name: Copy ---YourRepoName Repository 

on:
  push:
    branches:
      - ---main # Change if you want to copy another branch of your repository
  workflow_dispatch:

jobs:
  copy_repository:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout ---YourRepoName Repository
        uses: actions/checkout@v2

      - name: Push directory to another repository directory
        # GitHub access token
        env:
          API_TOKEN_GITHUB: '${{ secrets.API_TOKEN_GITHUB }}'
        # You may pin to the exact commit or the version.
        # uses: notpresident35/copy_large_folder_to_another_repo_action@80f614525ae4ffb75699ae3f543f26979353924c
        uses: datalbry/copy_folder_to_another_repo_action@1.0.0
        with:
          # Comment line to use default value if there is default value
          # Source directory from the origin directory
          source_folder: '.'
          # Destination repository
          destination_repo: 'mishavoloshchuk/mishavoloshchuk.github.io'
          # [Optional] The directory to wipe and replace in the target repository
          destination_folder: 'projects/---YourRepoName' # optional, default is .
          # Email for the git commit
          user_email: 'voloshchuk123@gmail.com'
          # Name of the destination
          user_name: 'mishavoloshchuk'
          # [Optional] set target branch name for the destination repository. Defaults to "master" for historical reasons
          destination_branch: 'main' # optional, default is master
          # [Optional] commit message for the output repository. ORIGIN_COMMIT is replaced by the URL@commit in the origin repo
#          commit_msg: # optional, default is Update from ORIGIN_COMMIT
  ```
  > [!IMPORTANT]
  > Replace all values marked by `---` prefix with your values.

## 5 - Done!

> [!CAUTION]
> The action will delete `target-directory: projects/---YourRepoName` folder before every copying.