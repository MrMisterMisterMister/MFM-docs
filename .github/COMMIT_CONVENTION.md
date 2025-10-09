# Commit Message Convention

This document outlines the commit message and Git tagging strategy for the Multiflexmeter Documentation project.

## Philosophy

- **Commit messages**: Clean, concise, following GitHub's official style (sentence case, imperative mood)
- **Git tags**: Used to categorize commits for easy filtering and searching through history

## Commit Message Format

```
Update firmware component relationships
Add troubleshooting section to configuration guide
Fix broken links in hardware reference
```

**Rules:**
- Start with a verb in imperative mood (Update, Add, Fix, Remove, Refactor, etc.)
- Use sentence case (first word capitalized, rest lowercase unless proper noun)
- No period at the end
- Keep under 72 characters for the first line
- Be specific and descriptive

## Git Tags for Organization

After making commits, tag them with relevant categories to enable easy filtering:

```bash
# Make your commit
git commit -m "Update getting started guide"

# Tag it with relevant categories
git tag docs/guide
git tag content/update
```

### Tag Categories

Use hierarchical format `category/type` for organization:

#### Content Tags
- `docs/guide` - Changes to guide pages (getting-started, architecture, configuration)
- `docs/reference` - Changes to reference pages (API, hardware, protocol)
- `docs/landing` - Changes to index/landing page
- `content/update` - Updates to existing content
- `content/new` - New content or pages added

#### Visual Tags
- `diagrams/system` - System context diagram changes
- `diagrams/container` - Container context diagram changes
- `diagrams/component` - Component context diagram changes
- `diagrams/code` - Code context diagram changes
- `assets/images` - Image or media file changes
- `assets/icons` - Icon or favicon changes

#### Technical Tags
- `config/astro` - Astro configuration changes
- `config/nav` - Navigation/sidebar changes
- `build/deps` - Dependency updates
- `build/scripts` - Build script changes
- `fix/typo` - Typo corrections
- `fix/links` - Broken link fixes
- `fix/formatting` - Formatting issues

#### Maintenance Tags
- `chore/cleanup` - Code or file cleanup
- `chore/deps` - Routine dependency updates
- `refactor/structure` - File or folder restructuring
- `style/formatting` - Visual or style improvements

#### Feature Tags
- `feature/search` - Search functionality
- `feature/interactive` - Interactive elements
- `feature/navigation` - Navigation improvements

## Examples

### Simple Documentation Update
```bash
git commit -m "Update hardware pin mappings table"
git tag docs/reference
git tag content/update
```

### Adding New Content
```bash
git commit -m "Add EEPROM configuration examples"
git tag docs/guide
git tag content/new
```

### Diagram Update
```bash
git commit -m "Update firmware component relationships"
git tag diagrams/component
git tag content/update
```

### Bug Fix
```bash
git commit -m "Fix broken links in protocol reference"
git tag docs/reference
git tag fix/links
```

### Configuration Change
```bash
git commit -m "Reorganize sidebar navigation structure"
git tag config/nav
git tag refactor/structure
```

## Filtering Commits by Tags

```bash
# List all tags
git tag

# List tags matching pattern
git tag -l "docs/*"
git tag -l "diagrams/*"

# Show commits with specific tag
git log docs/guide

# Show commits with tag pattern
git log --simplify-by-decoration --decorate --all --oneline | grep "diagrams/"

# Find commit by tag
git show docs/reference

# Delete a tag (if misapplied)
git tag -d docs/guide

# Push tags to remote
git push --tags

# Push specific tag
git push origin docs/guide
```

## Multi-line Commit Messages

For complex changes requiring more detail:

```
Add comprehensive API reference documentation

- Document all sensor functions with examples
- Add parameter descriptions and return values
- Include error handling patterns
- Add cross-references to hardware guide
```

Then tag appropriately:
```bash
git tag docs/reference
git tag content/new
git tag feature/api
```

## Version Tags

For documentation releases, use semantic versioning with annotated tags:

```bash
# Create annotated version tag
git tag -a v1.0.0 -m "Initial documentation release"
git tag -a v1.1.0 -m "Add hardware reference section"
git tag -a v1.1.1 -m "Fix typos and broken links"

# Push version tags
git push origin v1.1.0

# List all version tags
git tag -l "v*"
```

## Quick Reference Table

| Change Type | Example Commit Message | Tags |
|-------------|------------------------|------|
| Update guide | `Update getting started prerequisites` | `docs/guide`, `content/update` |
| New reference | `Add LoRaWAN protocol specification` | `docs/reference`, `content/new` |
| Update diagram | `Revise container context diagram` | `diagrams/container`, `content/update` |
| Fix typo | `Correct sensor pin numbers` | `docs/reference`, `fix/typo` |
| Config change | `Update Astro sidebar structure` | `config/nav`, `refactor/structure` |
| Add asset | `Add Multiflexmeter board photo` | `assets/images`, `content/new` |
| Build update | `Upgrade Astro to latest version` | `build/deps`, `chore/deps` |
| New feature | `Add interactive code playground` | `feature/interactive`, `content/new` |

## Best Practices

1. **Commit often, tag strategically**: Not every commit needs tags, but important milestones should be tagged
2. **Use multiple tags**: A single commit can have 2-3 tags for different categorization perspectives
3. **Consistent naming**: Stick to `category/type` format for predictable filtering
4. **Annotated version tags**: Use `git tag -a` for release versions with descriptive messages
5. **Push tags separately**: Don't forget `git push --tags` to share tags with the team
6. **Clean up mistakes**: Use `git tag -d` locally and `git push origin :refs/tags/tagname` remotely

## Workflow Example

```bash
# 1. Make changes to documentation
# 2. Stage and commit with clean message
git add src/content/docs/guides/architecture.md
git commit -m "Update component diagram with new sensor module"

# 3. Tag the commit for organization
git tag diagrams/component
git tag docs/guide
git tag content/update

# 4. Push both commits and tags
git push
git push --tags
```

## Filtering Your History

```bash
# See all documentation guide changes
git log docs/guide --oneline

# See all diagram updates
git tag -l "diagrams/*" | xargs -I {} git log {} --oneline

# See all content additions
git log content/new --oneline

# See changes between versions
git log v1.0.0..v1.1.0 --oneline

# Show tag creation dates
git log --tags --simplify-by-decoration --pretty="format:%ai %d"
```

This approach keeps commit messages clean and GitHub-style while using Git's built-in tagging system for powerful filtering and organization.
