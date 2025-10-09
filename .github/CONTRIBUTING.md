# Contributing to MFM Documentation

Thank you for contributing to the Multiflexmeter V3.7.0 documentation!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/MFM-docs.git`
3. Create a branch: `git checkout -b docs/your-feature-name`
4. Make your changes
5. Test locally: `npm run dev`
6. Commit with our convention (see below)
7. Push and create a Pull Request

## Commit Convention

We use GitHub-style commit messages with Git tags for organization. See [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) for full details.

### Quick Format

**Commit Message:**
```
Update hardware pin mappings table
Add troubleshooting section
Fix broken links in protocol reference
```

**Then Tag:**
```bash
git tag docs/reference
git tag content/update
```

### Commit Message Rules
- Start with verb in imperative mood (Update, Add, Fix, Remove)
- Use sentence case (first word capitalized)
- No period at the end
- Keep under 72 characters
- Be specific and descriptive

### Common Tags
- `docs/guide`, `docs/reference`, `docs/landing` - Documentation changes
- `diagrams/system`, `diagrams/component` - Diagram updates
- `content/update`, `content/new` - Content changes
- `fix/typo`, `fix/links`, `fix/formatting` - Bug fixes
- `config/astro`, `config/nav` - Configuration changes
- `build/deps`, `chore/cleanup` - Maintenance

### Examples
```bash
# Commit with clean message
git commit -m "Add sensor calibration section to hardware guide"

# Tag for organization
git tag docs/guide
git tag content/new

# Push both
git push
git push --tags
```

## Setting Up Commit Template

Configure Git to use our commit message template:

```bash
git config commit.template .gitmessage
```

Now when you run `git commit`, you'll see helpful reminders!

## Documentation Guidelines

1. **Clear and Concise**: Write for clarity
2. **Examples**: Include practical code examples
3. **Cross-Reference**: Link to related sections
4. **Diagrams**: Update both PlantUML and LikeC4 versions
5. **Test**: Run `npm run build` before committing

## File Structure

- `src/content/docs/guides/` - Tutorial content
- `src/content/docs/reference/` - Reference documentation
- `public/diagrams/` - Architecture diagrams

## Pull Request Process

1. Update relevant documentation
2. Ensure `npm run build` succeeds
3. Update CHANGELOG.md if applicable
4. Request review from maintainers

## Questions?

Open an issue or discussion for any questions!
