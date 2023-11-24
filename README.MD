# Manual: How to add new repository?

## 1 - Create your personal access token
[Creating a personal access token](https://docs.github.com/en/enterprise-server@3.6/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token)
> [!IMPORTANT]
> Check at least a **repo** scope

## 2 - Add a secret for your repository
[Adding secrets for a repository](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-secrets-for-your-repository-and-organization-for-github-codespaces#adding-secrets-for-a-repository)

## 3 - Create a file
Create a file  named `.github/workflows/main.yml` in your repository (`main` can be any name of file)

## 4 - Code
Paste folowing code inside recently created `main.yml` file:
``` yaml
name: Copy ---YourRepoName Repository 

on:
  push:
    branches:
      - ---master # Change if you want to copy another branch of your repository
  workflow_dispatch:

jobs:
  copy_repository:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout YourRepoName Repository
        uses: actions/checkout@v2

      - name: Push directory to another repository directory
        # GitHub access token
        env:
          API_TOKEN_GITHUB: '${{ secrets.---API_TOKEN_GITHUB }}'
        # You may pin to the exact commit or the version.
        # uses: XenonMolecule/github-action-push-to-another-repository@de389add933e78b040fd9274822bd171ac87b26e
        uses: XenonMolecule/github-action-push-to-another-repository@0.1.0
        with:
          # Comment line to use default value if there is default value
          # Source directory from the origin directory
          source-directory: .
          # Name of the destination username/organization
          destination-github-username: mishavoloshchuk
          # Destination repository
          destination-repository-name: mishavoloshchuk.github.io
          # Email for the git commit
          user-email: actions@github.com
          # [Optional] Name for the git commit. Defaults to the destination username/organization name
          user-name: actions_bot # optional, default is 
          # [Optional] Username/organization for the destination repository
          destination-repository-username: mishavoloshchuk # optional, default is 
          # [Optional] set target branch name for the destination repository. Defaults to "master" for historical reasons
          target-branch: main # Set the destination branch (default is master)
          # [Optional] commit message for the output repository. ORIGIN_COMMIT is replaced by the URL@commit in the origin repo
#          commit-message: # optional, default is Update from ORIGIN_COMMIT
          # [Optional] The directory to wipe and replace in the target repository
          target-directory: projects/---YourRepoName # optional, default is .
```
> [!IMPORTANT]
> Replace all values marked `---` to your values.

## 5 - Done!

> [!CAUTION]
> The action will delete `target-directory: projects/---YourRepoName` folder before every copying.