//
//  focUIsWidget.swift
//  focUIsWidget
//
//  Created by Jonas Yukins on 7/31/25.
//

import WidgetKit
import SwiftUI

// Shared data structure
struct AppData: Codable, Identifiable {
    let id: String
    let displayName: String
    let packageName: String
    let urlScheme: String?
}

struct SectionedProvider: TimelineProvider {
    let sectionIndex: Int

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), apps: getDefaultApps())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), apps: getAppsFromUserDefaults(section: sectionIndex))
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let apps = getAppsFromUserDefaults(section: sectionIndex)
        let entry = SimpleEntry(date: Date(), apps: apps)
        
        // Update every 30 minutes
        let timeline = Timeline(entries: [entry], policy: .never)
        completion(timeline)
    }
    
    private func getAppsFromUserDefaults(section: Int) -> [AppData] {
        guard let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") else {
            print("Widget: Failed to access UserDefaults with suite name")
            return getDefaultApps()
        }

        let sectionKey = "selectedApps_section_\(section)"

        // Prefer section-specific key as JSON string
        if let jsonString = userDefaults.string(forKey: sectionKey) {
            if let data = jsonString.data(using: .utf8) {
                do {
                    let apps = try JSONDecoder().decode([AppData].self, from: data)
                    return apps
                } catch {
                    print("Widget: Failed to decode JSON string for section \(section): \(error)")
                }
            }
        }

        // Fallback to section data as Data
        if let data = userDefaults.data(forKey: sectionKey) {
            do {
                let apps = try JSONDecoder().decode([AppData].self, from: data)
                return apps
            } catch {
                print("Widget: Failed to decode UserDefaults data for section \(section): \(error)")
            }
        }

        // Fallback to array-of-dictionaries (plist) storage
        if let array = userDefaults.array(forKey: sectionKey) as? [[String: Any]] {
            let apps = array.compactMap { dict -> AppData? in
                guard let id = dict["id"] as? String,
                      let displayName = dict["displayName"] as? String,
                      let packageName = dict["packageName"] as? String else {
                    return nil
                }
                let urlScheme = dict["urlScheme"] as? String
                return AppData(id: id, displayName: displayName, packageName: packageName, urlScheme: urlScheme)
            }
            if !apps.isEmpty { return apps }
        }

        // Fallback to legacy key for section 1
        if section == 1 {
            if let jsonString = userDefaults.string(forKey: "selectedApps") {
                if let data = jsonString.data(using: .utf8) {
                    do {
                        let apps = try JSONDecoder().decode([AppData].self, from: data)
                        return apps
                    } catch {
                        print("Widget: Failed to decode legacy JSON string: \(error)")
                    }
                }
            }
            if let data = userDefaults.data(forKey: "selectedApps") {
                do {
                    let apps = try JSONDecoder().decode([AppData].self, from: data)
                    return apps
                } catch {
                    print("Widget: Failed to decode legacy data: \(error)")
                }
            }
            if let array = userDefaults.array(forKey: "selectedApps") as? [[String: Any]] {
                let apps = array.compactMap { dict -> AppData? in
                    guard let id = dict["id"] as? String,
                          let displayName = dict["displayName"] as? String,
                          let packageName = dict["packageName"] as? String else {
                        return nil
                    }
                    let urlScheme = dict["urlScheme"] as? String
                    return AppData(id: id, displayName: displayName, packageName: packageName, urlScheme: urlScheme)
                }
                if !apps.isEmpty { return apps }
            }
        }

        return getDefaultApps()
    }
    
    private func getDefaultApps() -> [AppData] {
        return [
            AppData(id: "1", displayName: "Messages", packageName: "com.apple.MobileSMS", urlScheme: "sms://")
        ]
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let apps: [AppData]
}

struct focUIsWidgetEntryView : View {
    var entry: SimpleEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(spacing: 6) {
            ForEach(entry.apps.prefix(6), id: \.id) { app in
                // Create deep link to focUIs app with app data
                let deepLink = "focuis://launch-app?name=\(app.displayName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&scheme=\(app.urlScheme?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&package=\(app.packageName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
                
                if let url = URL(string: deepLink) {
                    Link(destination: url) {
                        HStack {
                            Text(app.displayName)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.white)
                                .lineLimit(1)
                            
                            Spacer()
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                    }
                } else {
                    // Fallback for invalid URLs
                    HStack {
                        Text(app.displayName)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        
                        Spacer()
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(8)
                }
            }
        }
        .padding(12)
        .background(
            LinearGradient(
                gradient: Gradient(colors: [Color.black.opacity(0.7), Color.black.opacity(0.5)]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .cornerRadius(16)
    }
}

struct focUIsWidget1: Widget {
    let kind: String = "focUIsWidget1"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 1)) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs widget 1")
        .description("Apps in section 1")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget2: Widget {
    let kind: String = "focUIsWidget2"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 2)) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs widget 2")
        .description("Apps in section 2")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget3: Widget {
    let kind: String = "focUIsWidget3"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 3)) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs widget 3")
        .description("Apps in section 3")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget4: Widget {
    let kind: String = "focUIsWidget4"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 4)) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs widget 4")
        .description("Apps in section 4")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget5: Widget {
    let kind: String = "focUIsWidget5"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 5)) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs widget 5")
        .description("Apps in section 5")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget6: Widget {
    let kind: String = "focUIsWidget6"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 6)) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs widget 6")
        .description("Apps in section 6")
        .supportedFamilies([.systemLarge])
    }
}

#Preview(as: .systemLarge) {
    focUIsWidget1()
} timeline: {
    SimpleEntry(date: .now, apps: [
        AppData(id: "1", displayName: "Messages", packageName: "com.apple.MobileSMS", urlScheme: "sms://")
    ])
}
