#!/bin/bash
current_branch=$(git symbolic-ref --short HEAD)
schema_dir="src/server/db/schema"
temp_backup=".git/temp_schema_backup"

# Functions to improve readability and reduce repetition
fail() {
    echo "❌ $1"
    exit 1
}
info() { echo "ℹ️ $1"; }
success() { echo "✅ $1"; }
warn() { echo "⚠️ $1"; }
checking() { echo "🔍 $1"; }
process() { echo "🔄 $1"; }
backup() { echo "💾 $1"; }

# Prevent committing directly on main
[[ "$current_branch" == "main" ]] && {
    fail "Error: You cannot commit directly to 'main'."
    info "Please make commits on feature branches only."
}

# Run code quality checks
checking "Running code quality checks..."
pnpm check || fail "Code quality checks failed. Please fix the issues before committing."
success "Code quality checks passed!"

# Check for staged schema files
checking "Checking for staged schema files..."
staged_schema_files=$(git diff --cached --name-only --diff-filter=ACMR -- "$schema_dir")
[[ -z "$staged_schema_files" ]] && {
    info "No schema files staged for commit, skipping migration generation."
    exit 0
}

echo "📝 Found staged schema files:"
echo "$staged_schema_files"

# Handle schema migrations
[[ ! -d "$schema_dir" ]] && fail "Schema directory not found"

# Backup schema directory
backup "Saving current schema files state..."
mkdir -p "$temp_backup/$(dirname $schema_dir)"
cp -R "$schema_dir" "$temp_backup/$(dirname $schema_dir)/"
echo "📦 Schema directory backed up"

# Apply staged changes & generate migrations
process "Applying only staged changes to schema directory..."
git checkout -- "$schema_dir"

process "Generating migrations for staged schema files..."
echo -e "\n\n"
pnpm drizzle-kit generate
migration_exit_code=$?
echo -e "\n\n"

# Handle new/modified migrations
new_migrations=$(git ls-files --others --exclude-standard migrations/)
modified_migrations=$(git diff --name-only migrations/)

if [[ $migration_exit_code -eq 0 && (-n "$new_migrations" || -n "$modified_migrations") ]]; then
    success "Migrations generated successfully!"
    [[ -n "$new_migrations" ]] && {
        warn "Adding new migrations to staging area:"
        echo "$new_migrations"
        git add $new_migrations
    }
    [[ -n "$modified_migrations" ]] && {
        warn "Adding modified migrations to staging area:"
        echo "$modified_migrations"
        git add $modified_migrations
    }
elif [[ $migration_exit_code -ne 0 ]]; then
    fail "Migration generation failed. Please fix the issues before committing."
fi

# Restore original schema directory state
process "Restoring original schema directory state..."
if [[ -d "$temp_backup/$schema_dir" ]]; then
    cp -R "$temp_backup/$schema_dir"/* "$schema_dir"/
    echo "📦 Schema directory restored"
    rm -rf "$temp_backup"
else
    warn "Schema backup not found, cannot restore"
fi

[[ $migration_exit_code -ne 0 ]] && fail "Migration generation failed. Please fix the issues before committing."
success "Migration process completed!"
