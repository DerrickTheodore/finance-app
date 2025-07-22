#!/bin/bash

# iOS Development Quick Setup Script with SweetPad
echo "🚀 Setting up iOS development environment with SweetPad..."

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode is not installed. Please install Xcode from the App Store."
    exit 1
fi

# Check iOS Simulator availability
echo "📱 Checking for iOS Simulators..."
xcrun simctl list devices | grep "iPhone 15" || {
    echo "⚠️  iPhone 15 simulator not found. Available simulators:"
    xcrun simctl list devices | grep iPhone
    echo ""
    echo "You may need to install additional simulators in Xcode."
}

# Verify Swift toolchain
echo "🔧 Verifying Swift toolchain..."
SWIFT_PATH="/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/swift"
if [ -f "$SWIFT_PATH" ]; then
    echo "✅ Swift toolchain found at: $SWIFT_PATH"
    $SWIFT_PATH --version
else
    echo "❌ Swift toolchain not found. Please check Xcode installation."
    exit 1
fi

# Verify Xcode project
echo "📋 Verifying Xcode project..."
if xcodebuild -list -project MyFiApp.xcodeproj > /dev/null 2>&1; then
    echo "✅ Xcode project is valid"
else
    echo "❌ Xcode project validation failed"
    exit 1
fi

echo "✅ iOS project structure created successfully!"
echo ""
echo "🎯 SweetPad Integration Ready!"
echo ""
echo "Available VS Code commands:"
echo "• Cmd+Shift+P -> 'SweetPad: Build' - Build the iOS app"
echo "• Cmd+Shift+P -> 'SweetPad: Run' - Build and run in simulator"
echo "• Cmd+Shift+P -> 'SweetPad: Clean' - Clean build artifacts"
echo "• Cmd+Shift+P -> 'SweetPad: Test' - Run unit tests"
echo "• Cmd+Shift+P -> 'SweetPad: Select Simulator' - Choose target simulator"
echo ""
echo "Or use VS Code tasks:"
echo "• Cmd+Shift+P -> 'Tasks: Run Task' -> 'SweetPad: Build iOS App'"
echo "• Cmd+Shift+P -> 'Tasks: Run Task' -> 'SweetPad: Build & Run iOS App'"
echo ""
echo "🔧 Manual commands (if needed):"
echo "• Open in Xcode: open MyFiApp.xcodeproj"
echo "• Start simulator: pnpm run ios:simulator"
echo "• List devices: pnpm run ios:devices"
