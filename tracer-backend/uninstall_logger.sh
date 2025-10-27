#!/bin/bash

# Tracer Command Logger Uninstallation Script

set -e

echo "============================================"
echo "  Tracer Command Logger - Uninstallation"
echo "============================================"
echo ""

# Configuration
CONFIG_DIR="$HOME/.config/tracer"
LOG_FILE="$HOME/.command_history"

# Determine shell and config file
CURRENT_SHELL=$(basename "$SHELL")
if [ "$CURRENT_SHELL" = "bash" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
elif [ "$CURRENT_SHELL" = "zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
else
    SHELL_CONFIG=""
fi

# Remove from shell config
if [ -n "$SHELL_CONFIG" ] && [ -f "$SHELL_CONFIG" ]; then
    echo "Removing logger from $SHELL_CONFIG..."
    
    # Create backup
    cp "$SHELL_CONFIG" "$SHELL_CONFIG.backup.before_uninstall.$(date +%Y%m%d_%H%M%S)"
    echo "✓ Backup created"
    
    # Remove Tracer section
    if grep -q "Tracer Command Logger" "$SHELL_CONFIG"; then
        # Use sed to remove the Tracer section
        sed -i '/^# ====================================$/,/^CONFIG_EOF$/d' "$SHELL_CONFIG" 2>/dev/null || true
        # Also remove the specific lines
        sed -i '/Tracer Command Logger/,/^fi$/d' "$SHELL_CONFIG" 2>/dev/null || true
        echo "✓ Removed from $SHELL_CONFIG"
    else
        echo "⚠️  No Tracer logger found in $SHELL_CONFIG"
    fi
fi

# Remove config directory
if [ -d "$CONFIG_DIR" ]; then
    echo "Removing config directory: $CONFIG_DIR"
    rm -rf "$CONFIG_DIR"
    echo "✓ Config directory removed"
fi

# Ask about log file
if [ -f "$LOG_FILE" ]; then
    echo ""
    read -p "Do you want to remove the log file ($LOG_FILE)? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$LOG_FILE"
        echo "✓ Log file removed"
    else
        echo "⚠️  Log file kept at: $LOG_FILE"
    fi
fi

echo ""
echo "============================================"
echo "  Uninstallation Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Reload your shell configuration:"
echo "   source $SHELL_CONFIG"
echo ""
echo "2. Or open a new terminal session"
echo ""
echo "Backup files are kept in case you want to restore:"
echo "  - Shell config: $SHELL_CONFIG.backup.*"
echo ""

