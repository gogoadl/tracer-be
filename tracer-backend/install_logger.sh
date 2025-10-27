#!/bin/bash

# Tracer Command Logger Installation Script
# This script sets up automatic command logging for bash/zsh

set -e

echo "============================================"
echo "  Tracer Command Logger - Installation"
echo "============================================"
echo ""

# Configuration
LOG_FILE="$HOME/.command_history"
CONFIG_DIR="$HOME/.config/tracer"
INSTALL_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Detect shell
CURRENT_SHELL=$(basename "$SHELL")
echo "Detected shell: $CURRENT_SHELL"

# Create config directory
mkdir -p "$CONFIG_DIR"

# Create logger script
cat > "$CONFIG_DIR/command_logger.sh" << 'LOGGER_EOF'
#!/bin/bash
# Tracer Command Logger

LOG_FILE="$HOME/.command_history"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
USERNAME=$(whoami)
DIR=$(pwd)
COMMAND=$(history 1 | sed 's/^[ ]*[0-9]*[ ]*//')

# Skip if command is empty or is the logging command itself
if [ -z "$COMMAND" ] || [[ "$COMMAND" == *"command_logger.sh"* ]] || [[ "$COMMAND" == "history "* ]]; then
    return
fi

# Log format: YYYY-MM-DD HH:MM:SS [user] ~/path: command
echo "$TIMESTAMP [$USERNAME] $DIR: $COMMAND" >> "$LOG_FILE"

# Keep log file size manageable (optional: keep last 10,000 lines)
tail -n 10000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
LOGGER_EOF

chmod +x "$CONFIG_DIR/command_logger.sh"

echo "✓ Logger script created at $CONFIG_DIR/command_logger.sh"

# Determine shell config file
if [ "$CURRENT_SHELL" = "bash" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_PROMPT_COMMAND="PROMPT_COMMAND"
elif [ "$CURRENT_SHELL" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_PROMPT_COMMAND="precmd"
else
    echo "⚠️  Unsupported shell: $CURRENT_SHELL"
    echo "Please manually add the logging to your shell configuration file"
    exit 1
fi

# Check if already installed
if grep -q "Tracer Command Logger" "$SHELL_CONFIG" 2>/dev/null; then
    echo "⚠️  Tracer logger already installed in $SHELL_CONFIG"
    read -p "Do you want to reinstall? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
fi

# Backup original config
cp "$SHELL_CONFIG" "$SHELL_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Backup created: $SHELL_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Add logging to shell config
cat >> "$SHELL_CONFIG" << CONFIG_EOF

# ====================================
# Tracer Command Logger
# Installed: $(date)
# ====================================
source ~/.config/tracer/command_logger.sh

# For bash: call logger before showing prompt
if [ "\$SHELL" = "bash" ]; then
    PROMPT_COMMAND="~/.config/tracer/command_logger.sh; \$PROMPT_COMMAND"
fi

# For zsh: call logger before prompt
if [ "\$SHELL" = "zsh" ]; then
    precmd() {
        ~/.config/tracer/command_logger.sh
    }
fi
CONFIG_EOF

echo "✓ Logger added to $SHELL_CONFIG"

# Create initial log file
touch "$LOG_FILE"
chmod 600 "$LOG_FILE"
echo "✓ Log file created: $LOG_FILE"

# Test the logger
echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "Log file location: $LOG_FILE"
echo "Config directory: $CONFIG_DIR"
echo ""
echo "Next steps:"
echo "1. Reload your shell configuration:"
echo "   source $SHELL_CONFIG"
echo ""
echo "2. Or open a new terminal session"
echo ""
echo "3. Test by running a command, then check:"
echo "   tail -f $LOG_FILE"
echo ""
echo "4. Start the Tracer backend to view logs in the dashboard"
echo ""

