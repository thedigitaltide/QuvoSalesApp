#!/bin/bash

# QuvoSalesApp Distribution Helper
# This script makes it easy to distribute your app to testers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}📱 QuvoSalesApp Distribution Helper${NC}"
echo -e "${BLUE}===================================${NC}"

COMMAND=${1:-"help"}

case $COMMAND in
    "testflight"|"tf")
        echo -e "${BLUE}🚀 Building for TestFlight...${NC}"
        echo -e "${YELLOW}This will create an IPA ready for TestFlight upload${NC}"
        echo ""
        
        fastlane ios build_for_testflight
        
        echo -e "\n${GREEN}✅ TestFlight build complete!${NC}"
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "  1. Go to ${PURPLE}https://appstoreconnect.apple.com${NC}"
        echo -e "  2. Navigate to My Apps → QuvoSalesApp → TestFlight"
        echo -e "  3. Upload the IPA file: ${YELLOW}fastlane/builds/QuvoSalesApp-TestFlight.ipa${NC}"
        echo -e "  4. Add testers in TestFlight"
        ;;
        
    "partner")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo -e "${RED}❌ Usage: $0 partner 'Device Name' 'DEVICE_UDID'${NC}"
            echo -e "${YELLOW}Example: $0 partner 'Johns iPhone' 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'${NC}"
            echo -e "\n${BLUE}To get UDID:${NC}"
            echo -e "  • Visit https://udid.tech on their iPhone"
            echo -e "  • Or connect device to Mac with Xcode"
            exit 1
        fi
        
        DEVICE_NAME=$2
        DEVICE_UDID=$3
        
        echo -e "${BLUE}🤝 Setting up device: ${DEVICE_NAME}${NC}"
        echo -e "${BLUE}UDID: ${DEVICE_UDID}${NC}"
        echo ""
        
        fastlane ios setup_partner name:"$DEVICE_NAME" udid:"$DEVICE_UDID"
        
        echo -e "\n${GREEN}✅ ${DEVICE_NAME} is ready for testing!${NC}"
        echo -e "${BLUE}Send them the IPA file created in fastlane/builds/${NC}"
        ;;
        
    "adhoc")
        echo -e "${BLUE}🧪 Building ad-hoc version for registered devices...${NC}"
        fastlane ios build_adhoc
        echo -e "\n${GREEN}✅ Ad-hoc build complete!${NC}"
        echo -e "${BLUE}Install on registered devices via AirDrop or email${NC}"
        ;;
        
    "status")
        echo -e "${BLUE}📊 System Status${NC}"
        ./setup-certificates.sh status
        echo ""
        echo -e "${BLUE}📁 Available builds:${NC}"
        if [ -d "fastlane/builds" ]; then
            ls -la fastlane/builds/*.ipa 2>/dev/null || echo -e "${YELLOW}  No IPA files found${NC}"
        else
            echo -e "${YELLOW}  No builds directory found${NC}"
        fi
        ;;
        
    "clean")
        echo -e "${BLUE}🧹 Cleaning build artifacts...${NC}"
        rm -rf fastlane/builds/*
        rm -rf ios/build/*
        echo -e "${GREEN}✅ Build artifacts cleaned${NC}"
        ;;
        
    "help"|*)
        echo -e "${YELLOW}Available commands:${NC}"
        echo -e "${GREEN}  testflight, tf${NC}        - Build for TestFlight (manual upload)"
        echo -e "${GREEN}  partner <name> <udid>${NC} - Set up device for direct install"
        echo -e "${GREEN}  adhoc${NC}                 - Build for registered test devices"
        echo -e "${GREEN}  status${NC}                - Show system and certificate status"
        echo -e "${GREEN}  clean${NC}                 - Clean build artifacts"
        echo -e "${GREEN}  help${NC}                  - Show this help"
        echo ""
        echo -e "${YELLOW}Examples:${NC}"
        echo -e "  $0 testflight"
        echo -e "  $0 partner 'Business Partner' 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'"
        echo -e "  $0 adhoc"
        echo ""
        echo -e "${BLUE}📖 Full documentation: DISTRIBUTION_GUIDE.md${NC}"
        echo -e "${BLUE}🔐 Certificate help: ./setup-certificates.sh help${NC}"
        ;;
esac

echo -e "\n${GREEN}🎉 Distribution helper complete!${NC}"