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
            return getDefaultApps()
        }
        
        if let data = userDefaults.data(forKey: "selectedApps"),
           let apps = try? JSONDecoder().decode([AppData].self, from: data) {
            return apps
        }
        
        return getDefaultApps()
    }
    
    private func getDefaultApps() -> [AppData] {
        return [
            AppData(id: "1", displayName: "Messages", packageName: "com.apple.MobileSMS", urlScheme: "sms://"),
            AppData(id: "2", displayName: "Mail", packageName: "com.apple.mobilemail", urlScheme: "mailto://"),
            AppData(id: "3", displayName: "Safari", packageName: "com.apple.mobilesafari", urlScheme: "x-web-search://"),
            AppData(id: "4", displayName: "Phone", packageName: "com.apple.mobilephone", urlScheme: "tel://"),
            AppData(id: "5", displayName: "Camera", packageName: "com.apple.camera", urlScheme: "camera://"),
            AppData(id: "6", displayName: "Settings", packageName: "com.apple.Preferences", urlScheme: "App-Prefs://")
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
                Button(action: {
                    launchApp(app)
                }) {
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
                .buttonStyle(PlainButtonStyle())
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
    
    private func launchApp(_ app: AppData) {
        // Store the app to launch in UserDefaults for the main app to handle
        if let userDefaults = UserDefaults(suiteName: "group.com.jonasyukins.focuis") {
            let launchData = [
                "packageName": app.packageName,
                "urlScheme": app.urlScheme ?? ""
            ]
            userDefaults.set(launchData, forKey: "widgetLaunchRequest")
            userDefaults.synchronize()
        }
        
        // Reload the widget timeline
        WidgetCenter.shared.reloadAllTimelines()
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
        AppData(id: "1", displayName: "Messages", packageName: "com.apple.MobileSMS", urlScheme: "sms://"),
        AppData(id: "2", displayName: "Mail", packageName: "com.apple.mobilemail", urlScheme: "mailto://"),
        AppData(id: "3", displayName: "Safari", packageName: "com.apple.mobilesafari", urlScheme: "x-web-search://")
    ])
}
