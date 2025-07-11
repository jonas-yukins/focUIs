import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userApps: defineTable({
    userId: v.string(),
    appName: v.string(),
    packageName: v.string(),
    isSelected: v.boolean(),
    displayName: v.string(),
    order: v.number(),
    urlScheme: v.optional(v.string()), // For iOS app launching
    appStoreUrl: v.optional(v.string()), // For iOS App Store fallback
    isThirdParty: v.optional(v.boolean()), // For iOS third-party app handling
  }),
  
  userSettings: defineTable({
    userId: v.string(),
    theme: v.optional(v.string()),
    fontSize: v.optional(v.number()),
    layout: v.optional(v.string()),
  }),

  userWidgets: defineTable({
    userId: v.string(),
    widgetId: v.string(), // "widget_1", "widget_2", etc.
    appIds: v.array(v.string()), // Array of app IDs that belong to this widget
    order: v.number(), // Order of the widget
  }),
});
