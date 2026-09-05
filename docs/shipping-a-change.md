# Shipping a change

The exact path from a dirty working tree to merged, and the traps that cost time on the way.

`main` is protected by a ruleset: a direct `git push origin main` is rejected server side (GH013),
even when it is the only thing you want. The way in is a branch, a pull request and a squash merge
once `verify` is green. Auto-merge is not enabled on this repository, so `gh pr merge --auto`
fails; wait for the run, then merge.

## 1. Branch from origin, not from local main

```sh
git fetch origin
git switch -c feat/<name> origin/main
```

After a squash merge your local `main` holds commits that are not ancestors of `origin/main` even
though their content is already in. Do not try to keep them. Branch from `origin/main`; if you are
mid-work on those commits, `git reset --soft origin/main` first and keep the changes staged.

## 2. Look before you stage

```sh
git status --short
```

Other sessions edit this tree while you work. Stage the paths you touched by name. If you sweep
with `git add -A` because the branch is one body of work, read the extra diffs first and say what
they are in the commit message.

## 3. Run what CI runs

The hooks cover less than CI does, so a green commit can still fail the build. The gaps are
`knip`, the template guards, and `build` plus `budget`.

| Runs where      | Checks                                                     |
| --------------- | ---------------------------------------------------------- |
| pre-commit hook | `prettier --check` and `eslint` on staged files            |
| pre-push hook   | `pnpm typecheck`, `pnpm test`                              |
| CI `verify`     | the above plus `format:check`, the template guards, `knip` |
| CI `budget`     | `pnpm build`, `pnpm budget`                                |
| CI `e2e`        | `pnpm e2e` on Chromium                                     |

```sh
pnpm prettier --write <the files you changed>
pnpm typecheck && pnpm lint && pnpm format:check && pnpm knip && pnpm test
pnpm build && pnpm budget
```

If you touched `templates/`, run the two guards CI runs. They are plain greps that do not skip
comments, so a hex code written in a comment fails the build:

```sh
grep -rEn "#[0-9a-fA-F]{3,8}\b" templates/ --include="*.ts" --include="*.tsx"
```

## 4. Commit and push

```sh
git add <paths>
git commit -F - <<'EOF'
type(scope): what changed, in the imperative

Why, and anything measured.
EOF
git push -u origin feat/<name>
```

If a commit hangs, look for orphan `lefthook.exe` processes and their `git.exe` parents before
diagnosing anything else.

## 5. Open the PR and wait for the run

```sh
gh pr create --base main --title "..." --body-file -
gh run watch $(gh run list --branch feat/<name> --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
```

Do not wait with `gh pr checks --watch --fail-fast`. It exits the moment it sees the red Vercel
check, which is not a required check and stays red until `OWNER_EMAIL` and `NEXT_PUBLIC_APP_URL`
are set for the Preview environment as well as Production.

## 6. Merge and come back to main

```sh
gh pr merge <number> --squash --delete-branch
git switch main && git pull --ff-only origin main
```
