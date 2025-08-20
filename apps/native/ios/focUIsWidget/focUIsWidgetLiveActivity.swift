//
//  focUIsWidgetLiveActivity.swift
//  focUIsWidget
//
//  Created by Jonas Yukins on 7/31/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct focUIsWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct focUIsWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: focUIsWidgetAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension focUIsWidgetAttributes {
    fileprivate static var preview: focUIsWidgetAttributes {
        focUIsWidgetAttributes(name: "World")
    }
}

extension focUIsWidgetAttributes.ContentState {
    fileprivate static var smiley: focUIsWidgetAttributes.ContentState {
        focUIsWidgetAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: focUIsWidgetAttributes.ContentState {
         focUIsWidgetAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: focUIsWidgetAttributes.preview) {
   focUIsWidgetLiveActivity()
} contentStates: {
    focUIsWidgetAttributes.ContentState.smiley
    focUIsWidgetAttributes.ContentState.starEyes
}
