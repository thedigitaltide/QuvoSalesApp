#!/bin/bash

# Complete Apple Developer Certificate Setup Script
# This script handles all certificate management using Fastlane Match

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Apple Developer Certificate Setup${NC}"
echo -e "${BLUE}====================================${NC}"

# Check if .env file exists
if [ ! -f "fastlane/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp fastlane/.env.example fastlane/.env
    echo -e "${RED}❌ Please edit fastlane/.env with your Apple Developer credentials before continuing${NC}"
    echo -e "${YELLOW}Required values:${NC}"
    echo -e "  • FASTLANE_TEAM_ID (your 10-character Apple Developer Team ID)"
    echo -e "  • FASTLANE_USER (your Apple ID email)"  
    echo -e "  • MATCH_PASSWORD (strong password to encrypt certificates)"
    echo -e "${YELLOW}📝 Edit the file now: nano fastlane/.env${NC}"
    exit 1
fi

# Load environment variables
source fastlane/.env

# Validate required variables
echo -e "${BLUE}🔍 Validating configuration...${NC}"

if [ -z "$FASTLANE_TEAM_ID" ] || [ "$FASTLANE_TEAM_ID" = "YOUR_10_CHARACTER_TEAM_ID" ]; then
    echo -e "${RED}❌ FASTLANE_TEAM_ID not set in fastlane/.env${NC}"
    exit 1
fi

if [ -z "$FASTLANE_USER" ] || [ "$FASTLANE_USER" = "your-apple-id@example.com" ]; then
    echo -e "${RED}❌ FASTLANE_USER not set in fastlane/.env${NC}"
    exit 1
fi

if [ -z "$MATCH_PASSWORD" ] || [ "$MATCH_PASSWORD" = "create-a-strong-password-here-min-8-chars" ]; then
    echo -e "${RED}❌ MATCH_PASSWORD not set in fastlane/.env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuration valid${NC}"
echo -e "${PURPLE}Team ID: ${FASTLANE_TEAM_ID}${NC}"
echo -e "${PURPLE}Apple ID: ${FASTLANE_USER}${NC}"
echo -e "${PURPLE}Certificate Repository: git@github.com:thedigitaltide/ios-certificates.git${NC}"

# Check command argument
COMMAND=${1:-"setup"}

case $COMMAND in
    "setup")
        echo -e "${BLUE}🚀 Setting up all certificates for QuvoSalesApp...${NC}"
        echo -e "${YELLOW}This will create:${NC}"
        echo -e "  • Development certificates (for local development)"
        echo -e "  • Ad-hoc certificates (for specific test devices)"  
        echo -e "  • App Store certificates (for TestFlight & App Store)"
        echo -e "${YELLOW}All certificates will be stored securely in your private GitHub repo.${NC}"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Setup cancelled${NC}"
            exit 0
        fi
        
        fastlane ios setup_certificates
        ;;
        
    "new-app")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ App identifier required${NC}"
            echo -e "${YELLOW}Usage: $0 new-app com.yourcompany.appname${NC}"
            exit 1
        fi
        
        APP_ID=$2
        echo -e "${BLUE}🆕 Setting up certificates for new app: ${APP_ID}${NC}"
        fastlane ios setup_new_app app_identifier:$APP_ID
        ;;
        
    "add-device")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${RED}❌ Device name and UDID required${NC}"
            echo -e "${YELLOW}Usage: $0 add-device 'Device Name' 'DEVICE_UDID'${NC}"
            echo -e "${YELLOW}To find UDID: Connect device -> Xcode -> Window -> Devices and Simulators${NC}"
            exit 1
        fi
        
        DEVICE_NAME=$2
        DEVICE_UDID=$3
        echo -e "${BLUE}📱 Adding device: ${DEVICE_NAME} (${DEVICE_UDID})${NC}"
        fastlane ios add_device name:"$DEVICE_NAME" udid:"$DEVICE_UDID"
        ;;
        
    "refresh")
        echo -e "${BLUE}🔄 Refreshing all certificates...${NC}"
        echo -e "${YELLOW}This will update all certificates and provisioning profiles${NC}"
        echo -e "${YELLOW}Use this when certificates expire or you need to update profiles${NC}"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Refresh cancelled${NC}"
            exit 0
        fi
        
        fastlane ios refresh_certificates
        ;;
        
    "testflight")
        echo -e "${BLUE}🚀 Building and uploading to TestFlight...${NC}"
        echo -e "${YELLOW}This will build the app and upload to TestFlight for beta testing${NC}"
        fastlane ios testflight
        ;;
        
    "adhoc")
        echo -e "${BLUE}🧪 Building ad-hoc version...${NC}"
        echo -e "${YELLOW}This builds an .ipa file for installation on specific registered devices${NC}"
        fastlane ios build_adhoc
        ;;
        
    "list-devices")
        echo -e "${BLUE}📱 Registered devices:${NC}"
        # Use spaceship to list devices
        fastlane run get_provisioning_profile app_identifier:"com.digitaltide.quvosalesapp" --verbose
        ;;
        
    "status")
        echo -e "${BLUE}📊 Certificate Status${NC}"
        echo -e "${BLUE}===================${NC}"
        
        # Check if certificates exist
        if [ -d ~/Library/MobileDevice/Provisioning\ Profiles ]; then
            PROFILE_COUNT=$(ls ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision 2>/dev/null | wc -l)
            echo -e "${GREEN}✅ Provisioning profiles installed: ${PROFILE_COUNT}${NC}"
        else
            echo -e "${YELLOW}⚠️  No provisioning profiles found${NC}"
        fi
        
        # Check keychain
        security find-identity -v -p codesigning 2>/dev/null | grep "iPhone" | wc -l | xargs printf "${GREEN}✅ Code signing certificates: %d${NC}\n" || echo -e "${YELLOW}⚠️  No certificates found${NC}"
        
        echo -e "\n${BLUE}📂 Certificate Repository:${NC} https://github.com/thedigitaltide/ios-certificates"
        ;;
        
    "help"|*)
        echo -e "${YELLOW}Available commands:${NC}"
        echo -e "${GREEN}  setup${NC}                    - Initial certificate setup for QuvoSalesApp"
        echo -e "${GREEN}  new-app <bundle_id>${NC}     - Setup certificates for a new app"
        echo -e "${GREEN}  add-device <name> <udid>${NC} - Add a new test device"
        echo -e "${GREEN}  refresh${NC}                 - Refresh all certificates and profiles"
        echo -e "${GREEN}  testflight${NC}              - Build and upload to TestFlight"
        echo -e "${GREEN}  adhoc${NC}                   - Build ad-hoc version for specific devices"
        echo -e "${GREEN}  status${NC}                  - Show certificate status"
        echo -e "${GREEN}  help${NC}                    - Show this help"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo -e "  $0 setup"
        echo -e "  $0 new-app com.mycompany.newapp"
        echo -e "  $0 add-device 'Johns iPhone' 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'"
        echo -e "  $0 testflight"
        ;;
esac

echo -e "\n${GREEN}🎉 Certificate management complete!${NC}"

# Show next steps
case $COMMAND in
    "setup")
        echo -e "\n${BLUE}📋 Next Steps:${NC}"
        echo -e "  • Test development build: ./deploy.sh dev"
        echo -e "  • Build for testers: $0 adhoc"
        echo -e "  • Upload to TestFlight: $0 testflight"
        echo -e "  • Add test devices: $0 add-device 'Device Name' 'UDID'"
        ;;
    "testflight")
        echo -e "\n${BLUE}📋 Next Steps:${NC}"
        echo -e "  • Check TestFlight in App Store Connect"
        echo -e "  • Add beta testers in TestFlight"
        echo -e "  • Submit for beta review if needed"
        ;;
    "adhoc")
        echo -e "\n${BLUE}📋 Next Steps:${NC}"
        echo -e "  • Install .ipa file on registered devices"
        echo -e "  • Share via AirDrop, email, or file sharing service"
        echo -e "  • Add more devices with: $0 add-device"
        ;;
esac