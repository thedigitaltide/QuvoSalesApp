import XCTest

class SnapshotUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
    }

    func testGenerateCEMEXScreenshots() throws {
        // Wait for app to load
        sleep(2)
        
        // Take screenshot of initial screen
        snapshot("01-WelcomeScreen")
        
        // Look for CEMEX demo button and tap it
        let cemexButton = app.buttons["CEMEX Demo"]
        if cemexButton.exists {
            cemexButton.tap()
            sleep(2)
            
            // Take screenshot of main dashboard with CEMEX branding
            snapshot("02-CEMEXDashboard")
            
            // Navigate through different sections if available
            // Look for navigation tabs or menu items
            let tabBar = app.tabBars.firstMatch
            if tabBar.exists {
                let tabs = tabBar.buttons
                if tabs.count > 0 {
                    tabs.element(boundBy: 0).tap()
                    sleep(1)
                    snapshot("03-CEMEXSection1")
                }
                
                if tabs.count > 1 {
                    tabs.element(boundBy: 1).tap()
                    sleep(1)
                    snapshot("04-CEMEXSection2")
                }
                
                if tabs.count > 2 {
                    tabs.element(boundBy: 2).tap()
                    sleep(1)
                    snapshot("05-CEMEXSection3")
                }
            }
        } else {
            // If no CEMEX demo button, just take screenshot of current screen
            snapshot("01-CurrentScreen")
        }
    }
}