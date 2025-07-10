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
  }),
  
  userSettings: defineTable({
    userId: v.string(),
    theme: v.optional(v.string()),
    fontSize: v.optional(v.number()),
    layout: v.optional(v.string()),
  }),
});
