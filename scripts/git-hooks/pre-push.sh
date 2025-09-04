#!/bin/sh
current_branch=$(git symbolic-ref --short HEAD)

# Helper functions for consistent messaging
fail() {
    echo "❌ $1"
    exit 1
}
warn() { echo "⚠️ $1"; }
info() { echo "📢 $1"; }

# Check if this is the first push to the remote repository
remote_refs=$(git ls-remote --quiet)
if [ -z "$remote_refs" ]; then
    # For first push, only allow main branch
    [ "$current_branch" != "main" ] && {
        fail "ERROR: This is the first push to the remote repository."
        echo "The first push must be made to the 'main' branch only."
        echo "Please switch to the main branch and try again."
    }
fi

# Handle main branch push (production deployment)
if [ "$current_branch" = "main" ]; then
    warn "WARNING: You are about to push to the main branch."
    echo "This will trigger a production deployment."
    echo ""

    while true; do
        read -p "Do you want to continue? (y/n): " yn
        case $yn in
            [Yy]*)
                echo "Proceeding with push to main branch..."
                break
                ;;
            [Nn]*)
                fail "Push to main branch cancelled."
                ;;
            *)
                echo "Please answer yes or no (or y or n)."
                ;;
        esac
    done
# Handle non-main branch push (preview deployment)
else
    info "INFO: You are pushing to the '$current_branch' branch."
    echo "This will trigger a preview deployment."
    echo ""
fi
