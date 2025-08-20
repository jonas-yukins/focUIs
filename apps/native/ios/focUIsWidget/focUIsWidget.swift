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

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), apps: getDefaultApps())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), apps: getAppsFromUserDefaults())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let apps = getAppsFromUserDefaults()
        let entry = SimpleEntry(date: Date(), apps: apps)
        
        // Update every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func getAppsFromUserDefaults() -> [AppData] {
        guard let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") else {
            print("Widget: Failed to access UserDefaults with suite name")
            return getDefaultApps()
        }
        
        // Try to get the data as a string first (React Native might save it as JSON string)
        if let jsonString = userDefaults.string(forKey: "selectedApps") {
            print("Widget: Found JSON string in UserDefaults: \(jsonString.prefix(100))...")
            if let data = jsonString.data(using: .utf8) {
                do {
                    let apps = try JSONDecoder().decode([AppData].self, from: data)
                    print("Widget: Successfully loaded \(apps.count) apps from UserDefaults string")
                    return apps
                } catch {
                    print("Widget: Failed to decode JSON string: \(error)")
                }
            }
        }
        
        // Try to get the data as Data
        if let data = userDefaults.data(forKey: "selectedApps") {
            do {
                let apps = try JSONDecoder().decode([AppData].self, from: data)
                print("Widget: Successfully loaded \(apps.count) apps from UserDefaults data")
                return apps
            } catch {
                print("Widget: Failed to decode UserDefaults data: \(error)")
            }
        }
        
        print("Widget: No valid data found in UserDefaults, using default apps")
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
    var entry: Provider.Entry
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

struct focUIsWidget: Widget {
    let kind: String = "focUIsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                focUIsWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                focUIsWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("focUIs Widget")
        .description("Quick access to your favorite apps")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

#Preview(as: .systemMedium) {
    focUIsWidget()
} timeline: {
    SimpleEntry(date: .now, apps: [
        AppData(id: "1", displayName: "Messages", packageName: "com.apple.MobileSMS", urlScheme: "sms://")
    ])
}
