#!/bin/bash

echo "🔍 SweetPad iOS Development Diagnostics"
echo "========================================"
echo ""

# Check VS Code Extensions
echo "📦 Checking VS Code Extensions..."
code --list-extensions | grep -i sweetpad || echo "❌ SweetPad extension not found"
code --list-extensions | grep -i swift || echo "⚠️  Swift extension not found"
echo ""

# Check Xcode Installation
echo "🛠️  Checking Xcode Setup..."
echo "Xcode path: $(xcode-select --print-path)"
echo "Xcode version: $(xcodebuild -version | head -1)"
echo ""

# Check Swift Toolchain
echo "🔧 Checking Swift Toolchain..."
echo "Active Swift: $(xcrun --find swift)"
echo "Swift version: $(xcrun swift --version | head -1)"
echo "SourceKit-LSP: $(xcrun --find sourcekit-lsp)"
echo ""

# Check Simulators
echo "📱 Checking iOS Simulators..."
echo "Available iPhone simulators:"
xcrun simctl list devices | grep iPhone | grep -v unavailable | head -5
echo ""

# Check Project Structure
echo "📋 Checking Project Structure..."
if [ -f "MyFiApp.xcodeproj/project.pbxproj" ]; then
    echo "✅ Xcode project found"
    echo "Schemes: $(xcodebuild -list -project MyFiApp.xcodeproj | grep -A 10 "Schemes:" | grep -v "Schemes:" | head -3)"
else
    echo "❌ Xcode project not found in current directory"
fi
echo ""

# Check VS Code Workspace Settings
echo "⚙️  Checking VS Code Settings..."
if [ -f "../../.vscode/settings.json" ]; then
    echo "✅ VS Code settings found"
    if grep -q "sweetpad" "../../.vscode/settings.json"; then
        echo "✅ SweetPad configuration found"
    else
        echo "❌ SweetPad configuration missing"
    fi
else
    echo "❌ VS Code settings not found"
fi
echo ""

# Test Swift compilation
echo "🧪 Testing Swift Compilation..."
echo 'print("Hello from Swift!")' > test.swift
if xcrun swift test.swift > /dev/null 2>&1; then
    echo "✅ Swift compilation working"
else
    echo "❌ Swift compilation failed"
fi
rm -f test.swift
echo ""

echo "🎯 Diagnostic Complete!"
echo ""
echo "To test SweetPad in VS Code:"
echo "1. Open VS Code in this workspace"
echo "2. Press Cmd+Shift+P"
echo "3. Type 'SweetPad: Build'"
echo "4. If the command appears, SweetPad is working"
echo ""
echo "If you see errors, check:"
echo "• Extension is installed: code --install-extension sweetpadsoftware.sweetpad"
echo "• Reload VS Code window: Cmd+Shift+P -> 'Developer: Reload Window'"
echo "• Check VS Code Output panel for SweetPad logs"
