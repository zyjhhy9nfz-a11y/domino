# Contributing to Louisiana Dominoes Game

Welcome to the team! This guide explains how to work on the game asynchronously with other developers.

---

## Quick Start for New Team Members

### 1. Clone the Repository
```bash
git clone <repo-path>
cd dominoes-proto
npm install
npm run dev
```

The game will run at `http://localhost:5174`

### 2. Read the Documentation
1. **README.md** — Project overview and setup
2. **DEVELOPMENT.md** (this folder) — Architecture and technical details
3. **plan.md** (shared folder) — The roadmap and todo tracking

### 3. Pick a Todo
See the **Async Workflow** section below to understand how to claim and work on tasks.

---

## Async Workflow

### Phase 1: Pick a Task
1. Check `TODO.md` in the project root for the task list
2. Find a task with status `AVAILABLE` (not claimed by someone else)
3. **Claim it** by creating a feature branch with your name:
   ```bash
   git checkout -b feat/user-initials-task-name
   # Example: feat/jd-mobile-responsive
   ```
4. Update `TODO.md` to mark the task `IN PROGRESS (Your Name)`
5. Commit this change:
   ```bash
   git commit -m "claim: mobile-responsive design (feat/jd-mobile-responsive)"
   ```

### Phase 2: Do the Work
1. Make changes to implement the feature
2. Test locally: `npm run dev`
3. Commit frequently with clear messages:
   ```bash
   git commit -m "feat: add touch-friendly layout for mobile

   - Adjust CSS breakpoints for 375px width (iPhone mini)
   - Convert flex layout to column on mobile
   - Increase button padding for touch targets
   - Test on actual device: iPhone 12 mini portrait"
   ```

### Phase 3: Submit Your Work
1. Update `TODO.md` to mark the task `DONE (Your Name)` with your completion date
2. Create a final commit:
   ```bash
   git commit -m "done: mobile-responsive design

   - Tested on iPhone 12 mini, iPad, desktop
   - All branch buttons touch-friendly
   - Game board scales properly
   - Closes feat/jd-mobile-responsive"
   ```
3. Push your branch to the shared repository:
   ```bash
   git push origin feat/jd-mobile-responsive
   ```
4. **Notify the team** (via Slack, email, or project chat):
   - Feature branch: `feat/jd-mobile-responsive`
   - What you built: Brief summary
   - Any blockers or questions: Yes/No, details if yes

### Phase 4: Code Review & Merge
1. Someone from the team reviews your branch (async, within 24-48 hours)
2. If feedback:
   - Make changes and commit: `git commit -m "refactor: feedback fixes"`
   - Push again: `git push origin feat/jd-mobile-responsive`
3. Once approved, someone merges to `main`:
   ```bash
   git checkout main
   git pull origin main
   git merge feat/jd-mobile-responsive
   git push origin main
   ```

---

## Task Format in TODO.md

Tasks in the shared TODO.md file follow this format:

```
### Phase 2: Polish & Usability

- [ ] **AVAILABLE** | mobile-responsive
  - Make game responsive for iPhone mini (375px portrait)
  - Redesign layout for touch interaction
  - Test on actual devices before marking done
  - **Blocked by**: (none) | **Depends on**: (none)

- [x] **DONE** (Sarah Kim, 2026-05-31) | tile-visual-polish
  - Improved tile styling with pip details
  - Added 3D effect and better colors
  - Feature branch: feat/sk-tile-visual-polish
```

**Format breakdown:**
- `[x]` or `[ ]` — Check when done
- **Status**: AVAILABLE | IN PROGRESS (Name) | DONE (Name, Date)
- **Task ID**: kebab-case identifier
- **Description**: What needs to be built
- **Blockers/Dependencies**: What this task needs
- **Feature branch**: Which branch has the code

---

## Commit Message Standards

### Format
```
<type>: <short summary (50 chars max)>

<detailed explanation (wrap at 72 chars)>

- Bullet point 1
- Bullet point 2
- Tested on: [devices/browsers]
```

### Types
- `feat:` — New feature (claim, in progress, done commits)
- `fix:` — Bug fix
- `refactor:` — Code restructuring (no behavior change)
- `style:` — Code style or formatting
- `test:` — Add tests
- `docs:` — Documentation
- `claim:` — Claiming a task
- `done:` — Task completion

### Examples
```
feat: add touch-friendly branch buttons

- Increase padding from 8px to 16px
- Use larger tap targets (48x48px minimum)
- Test on phone: iPhone 12 mini

feat: implement 3-player game mode

- Deal 6 tiles per player instead of 7
- Update AI for 3 opponents
- Add player selector UI
- Tested on desktop and tablet

fix: prevent double tile placement when internet is slow

- Add loading state to branch buttons
- Disable interaction during API call
- Show spinner while processing
```

---

## Code Style & Standards

### JavaScript
- **Variable names**: Clear, descriptive (`playerHand` not `ph`)
- **Comments**: Only for complex logic, not obvious code
- **Functions**: Single responsibility, descriptive names
- **Async code**: Use `await`, avoid callback chains

### HTML
- **Semantic**: Use `<button>`, `<main>`, `<section>` not just `<div>`
- **Accessibility**: Add `aria-label` and `role` where helpful
- **Structure**: Keep logical and readable

### CSS
- **Responsive**: Mobile-first approach (small screens first)
- **Variables**: Use CSS variables for colors, sizes (`:root { --primary: ... }`)
- **Classes**: kebab-case (`btn-primary` not `btnPrimary`)
- **Media queries**: Min-width breakpoints (375px, 768px, 1024px)

---

## Testing Your Work

Before submitting, test thoroughly:

### Desktop
```bash
npm run dev
# Open http://localhost:5174 in Chrome, Firefox, Safari
```

### Mobile (via DevTools)
```bash
# Chrome: F12 → Device toolbar → Select iPhone 12 mini
# Firefox: F12 → Responsive Design Mode
```

### Real Device (Recommended)
- iPhone: Open `http://<your-computer-ip>:5174` on your phone
- Android: Same approach

### What to Test
- [ ] Feature works as described in the todo
- [ ] Doesn't break existing features (play a full game)
- [ ] Looks good on 3+ different screen sizes
- [ ] No console errors (`F12 → Console`)
- [ ] Handles edge cases (empty boneyard, last tile, etc.)

---

## Handling Conflicts

### If Two People Pick the Same Task
1. Check the git log to see who started first
2. First person keeps it, second person picks another task
3. Update TODO.md to avoid future confusion

### If Your Branch Conflicts with Main
```bash
git fetch origin
git rebase origin/main
# Fix conflicts in your editor
git add .
git rebase --continue
git push origin feat/your-branch -f
```

---

## Getting Help

### Questions About the Code
- Read `DEVELOPMENT.md` (game architecture)
- Check `main.js` comments (implementation details)
- Ask in project chat before starting work

### Stuck on a Task
1. Update TODO.md: `IN PROGRESS (Your Name, BLOCKED)`
2. Document the blocker in a `BLOCKERS.md` file
3. Notify the team with details
4. Another team member can help unblock you

### Discovered a Bug
1. Create a new task in TODO.md under **Phase X: Bugs**
2. Document the bug clearly (steps to reproduce, expected vs actual)
3. Assign to yourself or ask for help

---

## Merging to Main

The person who reviews your work will merge it. But if you need to do it yourself:

```bash
# Make sure everything is committed
git status

# Switch to main and pull latest
git checkout main
git pull origin main

# Merge your feature
git merge feat/your-branch

# Push back to main
git push origin main

# Delete your feature branch (optional cleanup)
git branch -d feat/your-branch
git push origin --delete feat/your-branch
```

---

## Tips for Async Success

1. **Communicate clearly** — Commit messages are documentation for future you
2. **Work in small chunks** — Small PRs are easier to review and merge
3. **Test before pushing** — Don't rely on others to find bugs
4. **Update TODO.md frequently** — Keep the team in sync
5. **Ask questions early** — Don't guess about requirements
6. **Document blockers** — Help the team help you
7. **Celebrate wins** — Mark tasks done with pride! 🎉

---

## Project Structure

```
dominoes-proto/
├── main.js                 # Game engine + UI (950 lines)
├── index.html             # HTML shell
├── style.css              # Game styling
├── package.json           # Vite config + dependencies
├── .gitignore             # Git ignore rules
├── README.md              # Project overview
├── CONTRIBUTING.md        # This file
├── DEVELOPMENT.md         # Architecture & technical details
├── plan.md                # Roadmap (session artifacts)
├── TODO.md                # Task tracking for async work
├── BLOCKERS.md            # Known issues & blockers
└── node_modules/          # Dependencies (ignored in git)
```

---

## Quick Reference: Common Commands

```bash
# Clone and setup
git clone <repo-path>
cd dominoes-proto
npm install
npm run dev

# Create and work on a feature
git checkout -b feat/initials-task-name
# ... make changes ...
git add .
git commit -m "feat: description of changes"
git push origin feat/initials-task-name

# Update main after someone merges
git fetch origin
git checkout main
git pull origin main
npm install  # In case dependencies changed

# See what branches exist
git branch -a

# See commit history
git log --oneline -20
```

---

**Last Updated**: 2026-05-30  
**Created for async team collaboration**

Need help? Check the project chat or create an issue in BLOCKERS.md.
