# QuvoSalesApp Distribution Guide

## 🎯 **Your App is Ready!**

Your QuvoSalesApp has been successfully built and is ready for distribution. Here are your options:

### 📦 **Current Build**
- **IPA File**: `fastlane/builds/QuvoSalesApp.ipa`
- **Size**: ~50MB (estimated)
- **Bundle ID**: `com.digitaltide.quvosalesapp`
- **Ready for**: TestFlight, Ad-hoc distribution, or App Store

---

## 🚀 **Distribution Methods**

### **Method 1: TestFlight (Recommended for Business Partners)**

#### **Manual Upload (Easiest)**
1. Open **App Store Connect** in your browser: https://appstoreconnect.apple.com
2. Sign in with: `bob@digitalti.de`
3. Go to **My Apps** → **QuvoSalesApp** → **TestFlight**
4. Click **+** next to **iOS builds**
5. Upload the file: `fastlane/builds/QuvoSalesApp.ipa`
6. Add release notes: "Martin Marietta Sales Demo App - Ready for testing"

#### **Invite Testers**
1. In TestFlight, go to **External Groups** or **Internal Testing**
2. Click **Add Testers**
3. Enter your business partner's email
4. They'll receive an email to install TestFlight app
5. Once they install TestFlight, they can install your app

#### **Automated Upload** (If you want to set up password)
```bash
# Set your Apple ID password (one time setup)
export FASTLANE_PASSWORD="your-apple-id-password"

# Then upload automatically
fastlane ios testflight
```

### **Method 2: Direct IPA Distribution (Quick & Easy)**

#### **For Your Business Partner**
1. **Send the IPA file directly**:
   - Email the file: `fastlane/builds/QuvoSalesApp.ipa`
   - Or use AirDrop, Dropbox, Google Drive, etc.

2. **Installation Requirements**:
   - Their device UDID must be added to your Ad-hoc provisioning profile
   - Use this command to add their device:
   ```bash
   fastlane ios add_device name:"Partner iPhone" udid:"DEVICE_UDID_HERE"
   ```

3. **Get their Device UDID**:
   - Have them connect iPhone to Mac with Xcode
   - OR use this website: https://udid.tech/ (they visit on their iPhone)
   - OR they can find it in Settings → General → About → tap on Serial Number

4. **Rebuild for their device**:
   ```bash
   fastlane ios build_adhoc
   ```

---

## 🛠️ **Available Commands**

### **Building**
```bash
# Build for TestFlight
fastlane ios testflight

# Build for specific testers (ad-hoc)
fastlane ios build_adhoc

# Development build
fastlane ios build_dev
```

### **Device Management**
```bash
# Add a new test device
fastlane ios add_device name:"Device Name" udid:"DEVICE_UDID"

# Add multiple devices at once
fastlane ios add_device name:"John iPhone" udid:"UDID1"
fastlane ios add_device name:"Mary iPhone" udid:"UDID2"
```

### **Certificate Management**
```bash
# Refresh all certificates (if they expire)
fastlane ios refresh_certificates

# Check certificate status
./setup-certificates.sh status

# Setup certificates for a new app
fastlane ios setup_new_app app_identifier:com.yourcompany.newapp
```

---

## 📧 **Quick Distribution Steps for Business Partner**

### **Option A: TestFlight (Professional)**
1. Upload IPA to App Store Connect (manual upload)
2. Add partner as external tester
3. They get email → install TestFlight → install app

### **Option B: Direct Install (Fastest)**
1. Get partner's device UDID
2. Run: `fastlane ios add_device name:"Partner Phone" udid:"THEIR_UDID"`
3. Run: `fastlane ios build_adhoc`
4. Send them the new IPA file
5. They install via AirDrop or email attachment

---

## 🔧 **Troubleshooting**

### **If TestFlight Upload Fails**
- Use manual upload to App Store Connect website
- Or set FASTLANE_PASSWORD environment variable

### **If Ad-hoc Install Fails**
- Make sure device UDID is added correctly
- Rebuild with `fastlane ios build_adhoc` after adding device
- Check device is running iOS 13+ (React Native requirement)

### **Certificate Issues**
```bash
# Refresh everything
./setup-certificates.sh refresh
```

---

## 📱 **App Info**
- **App Name**: QuvoSalesApp
- **Bundle ID**: com.digitaltide.quvosalesapp
- **Team**: Digital Tide, LLC (MSMA322M62)
- **Target**: Martin Marietta Sales Demo
- **Contact**: Drew Shedd - (706) 524-6274

---

## 🎉 **You're All Set!**

Your complete iOS development and distribution pipeline is ready:

✅ **Automated certificate management**  
✅ **Professional build system**  
✅ **Multiple distribution options**  
✅ **Easy device management**  
✅ **Scalable for multiple apps**

Choose the method that works best for you and your business partner!