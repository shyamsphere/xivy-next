# CI workflow (pending activation)

`github-workflow.yml` is the GitHub Actions pipeline for this repo: typecheck,
lint, unit and module-integration tests, a storefront build with no backend
reachable, and the Playwright suite against a real seeded Medusa instance.

It lives here rather than at `.github/workflows/ci.yml` because GitHub rejects
a push that creates or updates files under `.github/workflows/` unless the
pushing token carries the `workflow` scope, and the account used for the
initial import did not have it.

To activate it, from an account whose token has the `workflow` scope
(`gh auth refresh -h github.com -s workflow`):

```bash
mkdir -p .github/workflows
git mv ci/github-workflow.yml .github/workflows/ci.yml
git rm ci/README.md
git commit -m "Activate CI workflow"
git push
```

Nothing else needs changing — the file is complete and unmodified.
