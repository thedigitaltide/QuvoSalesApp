//
//  SnapshotHelper.swift
//  Example
//
//  Created by Felix Krause on 10/8/15.
//

import Foundation
import XCTest

var deviceLanguage = ""
var locale = ""

func setupSnapshot(_ app: XCUIApplication, waitForAnimations: Bool = true) {
    Snapshot.setupSnapshot(app, waitForAnimations: waitForAnimations)
}

func snapshot(_ name: String, waitForLoadingIndicator: Bool = true) {
    if waitForLoadingIndicator {
        Snapshot.snapshot(name, waitForLoadingIndicator: waitForLoadingIndicator)
    } else {
        Snapshot.snapshot(name)
    }
}

enum SnapshotError: Error, CustomDebugStringConvertible {
    case cannotDetectUser
    case cannotFindSimulatorHomeDirectory
    case cannotFindXcodeInstallation
    case cannotAccessSimulatorHomeDirectory(String)
    case cannotRunOnPhysicalDevice
    
    var debugDescription: String {
        switch self {
        case .cannotDetectUser:
            return "Couldn't find Snapshot configuration files - can't detect current user"
        case .cannotFindSimulatorHomeDirectory:
            return "Couldn't find simulator home location. Please, check SIMULATOR_HOST_HOME env variable."
        case .cannotFindXcodeInstallation:
            return "Please make sure that Xcode is installed"
        case .cannotAccessSimulatorHomeDirectory(let simulatorHostHome):
            return "Can't prepare environment. Simulator home location is inaccessible. Does \(simulatorHostHome) exist?"
        case .cannotRunOnPhysicalDevice:
            return "Can't use Snapshot on a physical device."
        }
    }
}

@objcMembers
open class Snapshot: NSObject {
    static var app: XCUIApplication?
    static var waitForAnimations = true

    open class func setupSnapshot(_ app: XCUIApplication, waitForAnimations: Bool = true) {
        Snapshot.app = app
        Snapshot.waitForAnimations = waitForAnimations

        do {
            let launchArguments = ProcessInfo().arguments
            let locale = getLocale()
            let language = getLanguage()
            let testName = getTestName()

            let path = "/tmp/sims/\(language)/\(locale)/\(testName).png"

            setLanguage(app)
            setLocale(app)
            setLaunchArguments(app)
        }
    }

    class func setLanguage(_ app: XCUIApplication) {
        guard let language = getLanguage() else { return }

        deviceLanguage = language
        app.launchArguments += ["-AppleLanguages", "(\(language))"]
    }

    class func setLocale(_ app: XCUIApplication) {
        guard let locale = getLocale() else { return }

        app.launchArguments += ["-AppleLocale", "\(locale)"]
    }

    class func setLaunchArguments(_ app: XCUIApplication) {
        let launchArguments = ProcessInfo().arguments
        app.launchArguments += launchArguments
    }

    open class func snapshot(_ name: String, waitForLoadingIndicator: Bool = false) {
        if waitForLoadingIndicator {
            waitForLoadingIndicatorToDisappear()
        }

        sleep(1) // Execution will pause here for 1 second

        do {
            let screenshot = XCUIScreen.main.screenshot()
            guard let simulator = ProcessInfo().environment["SIMULATOR_DEVICE_NAME"], let language = getLanguage() else {
                print("error: Environment or language not set")
                return
            }

            let path = "/tmp/\(UUID().uuidString).png"
            try screenshot.pngRepresentation.write(to: URL(fileURLWithPath: path))

            guard let screenshotDir = screenshotDirectory() else {
                return
            }
            let nameWithSuffix = name + deviceName(simulator, language)
            let filename = nameWithSuffix.replacingOccurrences(of: " ", with: "-") + ".png"
            let destinationPath = screenshotDir.appendingPathComponent(filename).path
            try FileManager.default.moveItem(atPath: path, toPath: destinationPath)
            print("snapshot: \(destinationPath)")
        } catch let error {
            NSLog("Problem writing screenshot: \(error)")
        }
    }

    class func waitForLoadingIndicatorToDisappear() {
        let query = XCUIApplication().statusBars.children(matching: .other).element(boundBy: 1).children(matching: .other)

        while query.count > 4 {
            sleep(1)
        }
    }

    class func getLanguage() -> String? {
        let env = ProcessInfo().environment
        if let simulatorLanguageEnv = env["SIMULATOR_RUNTIME_LANGUAGE"] {
            return simulatorLanguageEnv
        } else if let simulatorLanguageEnv = env["FASTLANE_LANGUAGE"] {
            return simulatorLanguageEnv
        }

        return "en"
    }

    class func getLocale() -> String? {
        let env = ProcessInfo().environment
        if let simulatorLocaleEnv = env["SIMULATOR_RUNTIME_LOCALE"] {
            return simulatorLocaleEnv
        } else if let simulatorLocaleEnv = env["FASTLANE_LOCALE"] {
            return simulatorLocaleEnv
        }

        return "en_US"
    }

    class func getTestName() -> String {
        let env = ProcessInfo().environment
        if let testMethodName = env["FASTLANE_SNAPSHOT_NAME"] {
            return testMethodName
        }
        return "testSnapshot"
    }

    class func screenshotDirectory() -> URL? {
        do {
            let homeDir: URL
            // on simulator || on mac
            if let simulatorHostHome = ProcessInfo().environment["SIMULATOR_HOST_HOME"] {
                homeDir = URL(fileURLWithPath: simulatorHostHome)
            } else if let home = ProcessInfo().environment["HOME"] {
                homeDir = URL(fileURLWithPath: home)
            } else {
                throw SnapshotError.cannotDetectUser
            }

            return homeDir.appendingPathComponent("Library/Caches/tools.fastlane")
        } catch {
            NSLog("Problem writing screenshot: \(error)")
            return nil
        }
    }

    class func deviceName(_ simulator: String, _ language: String) -> String {
        // Default simulator background
        return simulator
    }
}