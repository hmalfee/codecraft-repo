#!/bin/sh

echo "#!/bin/sh
exec \"\$(git rev-parse --show-toplevel)/scripts/git-hooks/pre-commit.sh\" \"\$@\"
" > .git/hooks/pre-commit

echo "#!/bin/sh
exec \"\$(git rev-parse --show-toplevel)/scripts/git-hooks/pre-push.sh\" \"\$@\"
" > .git/hooks/pre-push

chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push

echo "🪝 Git hooks installed successfully!"
