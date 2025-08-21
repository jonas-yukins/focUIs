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

// Shared user settings structure
struct UserSettings: Codable {
    let theme: String // "default" | "dark" | "light"
    let fontSize: Double
    let layout: String // "left" | "center" | "right"
    let fontColor: String // hex or named color like "white"

    static func defaults() -> UserSettings {
        return UserSettings(theme: "default", fontSize: 16, layout: "center", fontColor: "#FFFFFF")
    }
}

struct SectionedProvider: TimelineProvider {
    let sectionIndex: Int

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), apps: getDefaultApps(), settings: getUserSettingsFromUserDefaults())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), apps: getAppsFromUserDefaults(section: sectionIndex), settings: getUserSettingsFromUserDefaults())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let apps = getAppsFromUserDefaults(section: sectionIndex)
        let settings = getUserSettingsFromUserDefaults()
        let entry = SimpleEntry(date: Date(), apps: apps, settings: settings)
        
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

    private func getUserSettingsFromUserDefaults() -> UserSettings {
        guard let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") else {
            return UserSettings.defaults()
        }
        if let jsonString = userDefaults.string(forKey: "userSettings"), let data = jsonString.data(using: .utf8), let decoded = try? JSONDecoder().decode(UserSettings.self, from: data) {
            return decoded
        }
        if let data = userDefaults.data(forKey: "userSettings"), let decoded = try? JSONDecoder().decode(UserSettings.self, from: data) {
            return decoded
        }
        return UserSettings.defaults()
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let apps: [AppData]
    let settings: UserSettings
}

struct focUIsWidgetEntryView : View {
    var entry: SimpleEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        let fontColor = colorFromString(entry.settings.fontColor)
        let alignment = entry.settings.layout
        let fontSize = entry.settings.fontSize

        ZStack {
            backgroundView(for: entry.settings.theme)
                .cornerRadius(16)

            VStack(spacing: 6) {
                ForEach(entry.apps.prefix(6), id: \.id) { app in
                    let deepLink = "focuis://launch-app?name=\(app.displayName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&scheme=\(app.urlScheme?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&package=\(app.packageName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"

                    if let url = URL(string: deepLink) {
                        Link(destination: url) {
                            row(for: app.displayName, fontColor: fontColor, fontSize: fontSize, alignment: alignment)
                        }
                    } else {
                        row(for: app.displayName, fontColor: fontColor, fontSize: fontSize, alignment: alignment)
                    }
                }
            }
            .padding(12)
        }
        .overlay(
            Group {
                if entry.settings.theme == "default" {
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white, lineWidth: 1)
                }
            }
        )
    }

    @ViewBuilder
    private func backgroundView(for theme: String) -> some View {
        switch theme {
        case "dark":
            Color.black
        case "light":
            Color.white
        default:
            Color.clear
        }
    }

    @ViewBuilder
    private func row(for text: String, fontColor: Color, fontSize: Double, alignment: String) -> some View {
        switch alignment {
        case "left":
            HStack {
                Text(text)
                    .font(.system(size: fontSize, weight: .semibold))
                    .foregroundColor(fontColor)
                    .lineLimit(1)
                Spacer()
            }
        case "right":
            HStack {
                Spacer()
                Text(text)
                    .font(.system(size: fontSize, weight: .semibold))
                    .foregroundColor(fontColor)
                    .lineLimit(1)
            }
        default:
            HStack {
                Spacer()
                Text(text)
                    .font(.system(size: fontSize, weight: .semibold))
                    .foregroundColor(fontColor)
                    .lineLimit(1)
                Spacer()
            }
        }
    }

    private func colorFromString(_ value: String) -> Color {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if trimmed == "white" { return .white }
        if trimmed == "black" { return .black }
        if trimmed.hasPrefix("#") {
            let hexString = String(trimmed.dropFirst())
            if let uiColor = UIColor(hex: hexString) {
                return Color(uiColor)
            }
        }
        return .white
    }
}

// MARK: - Helpers
extension UIColor {
    convenience init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hexSanitized).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hexSanitized.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            return nil
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
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
    ], settings: UserSettings.defaults())
}
