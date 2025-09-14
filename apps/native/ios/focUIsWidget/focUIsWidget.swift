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
    let appStoreUrl: String?
}

// Shared user settings structure
struct UserSettings: Codable {
    let fontSize: Double
    let layout: String // "left" | "center" | "right"
    let fontColor: String // hex or named color like "white"
    let verticalAlignment: String // "top" | "middle" | "bottom"
    // New optional fields for decoupled background/outline
    let backgroundStyle: String? // "default" | "blue" | "white" | "pink" | "gray"
    let outlineEnabled: Bool?
    let outlineColor: String? // "white" | "black"

    static func defaults() -> UserSettings {
        return UserSettings(
            fontSize: 16,
            layout: "center",
            fontColor: "#FFFFFF",
            verticalAlignment: "middle",
            backgroundStyle: "default",
            outlineEnabled: true,
            outlineColor: "white"
        )
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

        // Canonical format: section-specific key stored as a JSON string
        if let jsonString = userDefaults.string(forKey: sectionKey),
           let data = jsonString.data(using: .utf8) {
            do {
                let apps = try JSONDecoder().decode([AppData].self, from: data)
                return apps
            } catch {
                print("Widget: Failed to decode JSON string for section \(section): \(error)")
            }
        }

        return getDefaultApps()
    }
    
    private func getDefaultApps() -> [AppData] {
        return []
    }

    private func getUserSettingsFromUserDefaults() -> UserSettings {
        guard let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") else {
            return UserSettings.defaults()
        }
        if let jsonString = userDefaults.string(forKey: "userSettings"),
           let data = jsonString.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(UserSettings.self, from: data) {
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
        let fontSize = entry.settings.fontSize * 1.4 // Increase font size for widget
        let verticalAlignment = entry.settings.verticalAlignment

        ZStack {
            backgroundView(for: entry.settings)
                .cornerRadius(16)

            VStack(spacing: 12) { // Increased spacing from 6 to 12
                ForEach(entry.apps.prefix(6), id: \.id) { app in
                    let deepLink = "focuis://launch-app?name=\(app.displayName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&scheme=\(app.urlScheme?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&package=\(app.packageName.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&appStoreUrl=\(app.appStoreUrl?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"

                    if let url = URL(string: deepLink) {
                        Link(destination: url) {
                            row(for: app.displayName, fontColor: fontColor, fontSize: fontSize, alignment: alignment)
                        }
                    } else {
                        row(for: app.displayName, fontColor: fontColor, fontSize: fontSize, alignment: alignment)
                    }
                }
            }
            .padding(16) // Padding for content only
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: getVerticalAlignment(verticalAlignment))
        }
        .overlay(
            Group {
                let outlineOn = entry.settings.outlineEnabled ?? (entry.settings.backgroundStyle == "default")
                if outlineOn {
                    let outlineColorStr = entry.settings.outlineColor ?? (entry.settings.backgroundStyle == "white" || entry.settings.backgroundStyle == "pink" ? "black" : "white")
                    ContainerRelativeShape()
                        .stroke(colorFromString(outlineColorStr), lineWidth: 1)
                }
            }
        )
    }

    @ViewBuilder
    private func backgroundView(for settings: UserSettings) -> some View {
        // Map backgroundStyle values to colors (theme removed)
        let style = settings.backgroundStyle ?? "default"
        switch style {
        case "default":
            Color.black
        case "white":
            Color.white
        case "blue":
            Color(red: 16/255, green: 36/255, blue: 60/255) // #10243c
        case "pink":
            Color(red: 246/255, green: 235/255, blue: 239/255) // #f6ebef
        case "gray":
            Color(red: 36/255, green: 36/255, blue: 36/255) // #242424
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

    private func getVerticalAlignment(_ alignment: String) -> Alignment {
        switch alignment {
        case "top":
            return .top
        case "middle":
            return .center
        case "bottom":
            return .bottom
        default:
            return .center
        }
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
            focUIsWidgetEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget) // Only for iOS 17+
        }
        .contentMarginsDisabled() // Remove system margins to allow edge-to-edge background
        .configurationDisplayName("focUIs widget 1")
        .description("Apps in section 1")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget2: Widget {
    let kind: String = "focUIsWidget2"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 2)) { entry in
            focUIsWidgetEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget) // Only for iOS 17+
        }
        .contentMarginsDisabled() // Remove system margins to allow edge-to-edge background
        .configurationDisplayName("focUIs widget 2")
        .description("Apps in section 2")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget3: Widget {
    let kind: String = "focUIsWidget3"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 3)) { entry in
            focUIsWidgetEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget) // Only for iOS 17+
        }
        .contentMarginsDisabled() // Remove system margins to allow edge-to-edge background
        .configurationDisplayName("focUIs widget 3")
        .description("Apps in section 3")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget4: Widget {
    let kind: String = "focUIsWidget4"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 4)) { entry in
            focUIsWidgetEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget) // Only for iOS 17+
        }
        .contentMarginsDisabled() // Remove system margins to allow edge-to-edge background
        .configurationDisplayName("focUIs widget 4")
        .description("Apps in section 4")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget5: Widget {
    let kind: String = "focUIsWidget5"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 5)) { entry in
            focUIsWidgetEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget) // Only for iOS 17+
        }
        .contentMarginsDisabled() // Remove system margins to allow edge-to-edge background
        .configurationDisplayName("focUIs widget 5")
        .description("Apps in section 5")
        .supportedFamilies([.systemLarge])
    }
}

struct focUIsWidget6: Widget {
    let kind: String = "focUIsWidget6"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SectionedProvider(sectionIndex: 6)) { entry in
            focUIsWidgetEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget) // Only for iOS 17+
        }
        .contentMarginsDisabled() // Remove system margins to allow edge-to-edge background
        .configurationDisplayName("focUIs widget 6")
        .description("Apps in section 6")
        .supportedFamilies([.systemLarge])
    }
}

// MARK: - Spacer Widget (iOS Medium)

struct SpacerEntry: TimelineEntry {
    let date: Date
    let settings: UserSettings
}

struct SpacerProvider: TimelineProvider {
    func placeholder(in context: Context) -> SpacerEntry {
        SpacerEntry(date: Date(), settings: UserSettings.defaults())
    }

    func getSnapshot(in context: Context, completion: @escaping (SpacerEntry) -> ()) {
        completion(SpacerEntry(date: Date(), settings: getUserSettingsFromUserDefaults()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SpacerEntry>) -> ()) {
        let settings = getUserSettingsFromUserDefaults()
        let entry = SpacerEntry(date: Date(), settings: settings)
        completion(Timeline(entries: [entry], policy: .never))
    }

    private func getUserSettingsFromUserDefaults() -> UserSettings {
        guard let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") else {
            return UserSettings.defaults()
        }
        if let jsonString = userDefaults.string(forKey: "userSettings"),
           let data = jsonString.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(UserSettings.self, from: data) {
            return decoded
        }
        return UserSettings.defaults()
    }
}

struct focUIsSpacerEntryView: View {
    var entry: SpacerEntry

    var body: some View {
        // Use the same background mapping as section widgets, but no outline
        ZStack {
            backgroundView(for: entry.settings)
                .cornerRadius(16)
        }
        .padding(0)
    }

    @ViewBuilder
    private func backgroundView(for settings: UserSettings) -> some View {
        // Map backgroundStyle values to colors (theme removed)
        let style = settings.backgroundStyle ?? "default"
        switch style {
        case "default":
            Color.black
        case "white":
            Color.white
        case "blue":
            Color(red: 16/255, green: 36/255, blue: 60/255) // #10243c
        case "pink":
            Color(red: 246/255, green: 235/255, blue: 239/255) // #f6ebef
        case "gray":
            Color(red: 36/255, green: 36/255, blue: 36/255) // #242424
        default:
            Color.clear
        }
    }
}

struct focUIsSpacerWidget: Widget {
    let kind: String = "focUIsSpacerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SpacerProvider()) { entry in
            focUIsSpacerEntryView(entry: entry)
                .background(Color.clear)
                .containerBackground(.clear, for: .widget)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("focUIs Spacer")
        .description("Fills leftover space above or below your focUIs widget.")
        .supportedFamilies([.systemMedium])
    }
}

#Preview(as: .systemLarge) {
    focUIsWidget1()
} timeline: {
    SimpleEntry(date: .now, apps: [], settings: UserSettings.defaults())
}
