# Release Checklist

Use this checklist when preparing a new release of `@gravitate-health/lens-tool-lib`.

## Pre-Release Checks

- [ ] All changes are committed to `main` branch
- [ ] All tests pass: `npm test`
- [ ] No security vulnerabilities: `npm audit`
- [ ] Package contents verified: `npm pack --dry-run`

## Version Decision

Choose version bump based on changes (semver):
- [ ] **Patch** (1.0.0 → 1.0.1) - Bug fixes only
- [ ] **Minor** (1.0.0 → 1.1.0) - New functions, backwards compatible
- [ ] **Major** (1.0.0 → 2.0.0) - Breaking API changes

## Release Steps

1. **Run all tests**
   ```bash
   npm test
   ```
   - [ ] All 128 tests pass

2. **Security audit**
   ```bash
   npm audit
   ```
   - [ ] No vulnerabilities OR all reviewed and acceptable

3. **Verify package contents**
   ```bash
   npm pack --dry-run
   ```
   - [ ] Only essential files included (~16 files, ~25KB)
   - [ ] Source files present (src/)
   - [ ] Documentation present (README.md, docs/, examples/)
   - [ ] Test files excluded (test/)
   - [ ] GitHub templates excluded (.github/)

4. **Version bump**
   ```bash
   npm version [patch|minor|major]
   ```
   - [ ] package.json updated
   - [ ] package-lock.json updated
   - [ ] Git commit created ("v{version}")
   - [ ] Git tag created ("v{version}")

5. **Review version commit**
   ```bash
   git show HEAD
   git tag --list
   ```
   - [ ] Commit looks correct
   - [ ] Tag matches version

6. **Push to remote**
   ```bash
   git push && git push --tags
   ```
   - [ ] Commits pushed to GitHub
   - [ ] Tags pushed to GitHub

7. **Login to npm** (if needed)
   ```bash
   npm login
   ```
   - [ ] Authenticated

8. **Publish to npm**
   ```bash
   npm publish
   ```
   - [ ] Package published successfully
   - [ ] Verify at: https://www.npmjs.com/package/@gravitate-health/lens-tool-lib

## Post-Release

- [ ] Verify package can be installed: `npm install @gravitate-health/lens-tool-lib@{version}`
- [ ] Test in a consumer lens project
- [ ] Update CHANGELOG.md if maintained
- [ ] Announce release (if applicable)

## Rollback Plan

If issues are discovered after release:

1. **Unpublish** (within 72 hours if needed):
   ```bash
   npm unpublish @gravitate-health/lens-tool-lib@{version}
   ```

2. **Deprecate** (after 72 hours):
   ```bash
   npm deprecate @gravitate-health/lens-tool-lib@{version} "Message about issue"
   ```

3. Fix issue, test thoroughly, and publish new version

## Notes

- **Package size**: Should be ~25KB packed, ~110KB unpacked
- **File count**: ~16 files (src/, docs/, examples/, README, package.json)
- **Test count**: 128 tests across 8 test suites
- **Node version**: Supports Node.js >=14.0.0
- **License**: Apache 2.0
