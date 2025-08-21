//
//  MainApplication.swift
//  focUIs
//
//  Created to host native modules.
//

import Foundation
import WidgetKit
import React

@objc(WidgetReloader)
class WidgetReloader: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(reloadAllTimelines:rejecter:)
  func reloadAllTimelines(resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
      resolve(true)
    } else {
      resolve(false)
    }
  }

  // Write a value for a given key into the shared app group UserDefaults
  // so the Widget extension can immediately read it.
  @objc(setSharedItem:value:resolver:rejecter:)
  func setSharedItem(_ key: String,
                     value: String,
                     resolver resolve: RCTPromiseResolveBlock,
                     rejecter reject: RCTPromiseRejectBlock) {
    let suiteName = "group.com.jonasyukins.focuis"
    guard let sharedDefaults = UserDefaults(suiteName: suiteName) else {
      reject("no_suite", "Failed to access UserDefaults suite \(suiteName)", nil)
      return
    }

    sharedDefaults.set(value, forKey: key)
    // Ensure the value is written promptly
    sharedDefaults.synchronize()
    resolve(true)
  }
}


