# 📱 QuvoSalesApp - IPA Build Instructions

## 🚀 Quick Start for Building IPA

### Option 1: Using Xcode (Recommended)
1. **Open in Xcode:**
   ```bash
   cd ios/
   open QuvoSalesApp.xcworkspace
   ```

2. **Configure Code Signing:**
   - Select your development team in "Signing & Capabilities"
   - Choose "Automatically manage signing"
   - Select your provisioning profile

3. **Archive the App:**
   - Select "Generic iOS Device" as destination
   - Go to Product → Archive
   - Once archived, click "Distribute App"
   - Choose "Ad Hoc" for internal distribution
   - Follow the wizard to create IPA

### Option 2: Command Line (After setting up code signing)
```bash
cd ios/
xcodebuild -workspace QuvoSalesApp.xcworkspace \
           -scheme QuvoSalesApp \
           -configuration Release \
           -archivePath ./build/QuvoSalesApp.xcarchive \
           archive \
           -allowProvisioningUpdates

xcodebuild -exportArchive \
           -archivePath ./build/QuvoSalesApp.xcarchive \
           -exportPath ./build \
           -exportOptionsPlist ../ExportOptions.plist
```

### Option 3: Using Fastlane (Professional)
1. **Install Fastlane:**
   ```bash
   sudo gem install fastlane -NV
   ```

2. **Initialize Fastlane:**
   ```bash
   cd ios/
   fastlane init
   ```

3. **Build IPA:**
   ```bash
   fastlane beta
   ```

## 📋 Requirements
- Xcode 14+ with iOS SDK
- Valid Apple Developer Account
- Development/Distribution Certificate
- Provisioning Profile

## 🔧 Code Signing Setup

### For Personal Testing:
1. Add your Apple ID to Xcode preferences
2. Select your team in project settings
3. Enable "Automatically manage signing"

### For Distribution:
1. Create App ID in Apple Developer Portal
2. Generate Distribution Certificate
3. Create Ad Hoc Provisioning Profile
4. Download and install both

## 📦 Export Options
Create `ExportOptions.plist` for command line builds:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <false/>
</dict>
</plist>
```

## 📲 Installation Methods

### TestFlight (Recommended for Business)
1. Upload IPA to App Store Connect
2. Add testers via email
3. Testers install TestFlight app
4. Install via TestFlight

### Ad Hoc Distribution
1. Build with Ad Hoc provisioning
2. Share IPA file directly
3. Install via Apple Configurator or Xcode

### Enterprise Distribution (Requires Enterprise Account)
1. Build with Enterprise provisioning
2. Host IPA on secure server
3. Install via Safari with manifest file

## 🔍 Troubleshooting

**Code Signing Errors:**
- Ensure valid certificates and provisioning profiles
- Check bundle identifier matches provisioning profile
- Verify team selection in Xcode

**Build Failures:**
- Clean build folder (⌘+Shift+K)
- Delete derived data
- Reset package manager cache: `cd ios && pod deintegrate && pod install`

**Device Installation Issues:**
- Enable "Developer Mode" on iOS device
- Trust developer certificate in Settings → General → VPN & Device Management

## 📧 Sharing with Business Partners

### Method 1: Direct IPA Sharing
1. Build IPA with your development certificate
2. Share IPA file via secure cloud storage
3. Partner installs using Xcode or Apple Configurator
4. They need to trust your certificate on their device

### Method 2: TestFlight (Best for Business)
1. Upload to App Store Connect
2. Add partner as external tester
3. They receive email invitation
4. Install via TestFlight app (no certificate trust needed)

### Method 3: Enterprise Distribution (If Available)
1. Build with enterprise certificate
2. Host on HTTPS server with manifest
3. Share installation link
4. Partners install via Safari

## 🏃‍♂️ Quick Demo Setup
For immediate demo purposes:
1. Install Xcode
2. Open `ios/QuvoSalesApp.xcworkspace`
3. Select your team in signing settings
4. Build and run on simulator or connected device
5. Archive when ready for sharing

## 🚨 Important Notes
- IPA built with development certificate requires device registration
- Ad Hoc IPAs work on registered devices only (up to 100 devices)
- TestFlight is the easiest for business partner sharing
- Enterprise distribution requires Apple Enterprise account ($299/year)

## 🆘 Need Help?
If you encounter issues:
1. Check Apple Developer documentation
2. Verify all certificates and provisioning profiles
3. Try building on simulator first
4. Contact Apple Developer Support if needed

---
*Built with React Native 0.81 • Generated with Claude Code*