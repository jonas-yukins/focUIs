import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Auth } from "convex/server";

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all selected apps for a user
export const getUserApps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const apps = await ctx.db
      .query("userApps")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("isSelected"), true))
      .order("asc")
      .collect();

    return apps;
  },
});

// Get all available apps for a user (including unselected)
export const getAllUserApps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const apps = await ctx.db
      .query("userApps")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("asc")
      .collect();

    return apps;
  },
});

// Add or update an app for a user
export const upsertApp = mutation({
  args: {
    appName: v.string(),
    packageName: v.string(),
    displayName: v.string(),
    isSelected: v.boolean(),
    order: v.number(),
    urlScheme: v.optional(v.string()),
    appStoreUrl: v.optional(v.string()),
    isThirdParty: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    // Check if app already exists for this user
    const existingApp = await ctx.db
      .query("userApps")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("packageName"), args.packageName))
      .first();

    if (existingApp) {
      // Update existing app
      await ctx.db.patch(existingApp._id, {
        appName: args.appName,
        displayName: args.displayName,
        isSelected: args.isSelected,
        order: args.order,
        urlScheme: args.urlScheme,
        appStoreUrl: args.appStoreUrl,
        isThirdParty: args.isThirdParty,
      });
      return existingApp._id;
    } else {
      // Create new app
      return await ctx.db.insert("userApps", {
        userId,
        appName: args.appName,
        packageName: args.packageName,
        displayName: args.displayName,
        isSelected: args.isSelected,
        order: args.order,
        urlScheme: args.urlScheme,
        appStoreUrl: args.appStoreUrl,
        isThirdParty: args.isThirdParty,
      });
    }
  },
});

// Toggle app selection
export const toggleAppSelection = mutation({
  args: {
    packageName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const app = await ctx.db
      .query("userApps")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("packageName"), args.packageName))
      .first();

    if (app) {
      await ctx.db.patch(app._id, {
        isSelected: !app.isSelected,
      });
    }
  },
});

// Update app order
export const updateAppOrder = mutation({
  args: {
    packageName: v.string(),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const app = await ctx.db
      .query("userApps")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("packageName"), args.packageName))
      .first();

    if (app) {
      await ctx.db.patch(app._id, {
        order: args.newOrder,
      });
    }
  },
});

// Get user settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    return settings;
  },
});

// Update user settings
export const updateUserSettings = mutation({
  args: {
    theme: v.optional(v.string()),
    fontSize: v.optional(v.number()),
    layout: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const existingSettings = await ctx.db
      .query("userSettings")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, args);
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        ...args,
      });
    }
  },
});

// Get user widgets
export const getUserWidgets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const widgets = await ctx.db
      .query("userWidgets")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("asc")
      .collect();

    return widgets;
  },
});

// Create or update a widget
export const upsertWidget = mutation({
  args: {
    widgetId: v.string(),
    appIds: v.array(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    // Check if widget already exists for this user
    const existingWidget = await ctx.db
      .query("userWidgets")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("widgetId"), args.widgetId))
      .first();

    if (existingWidget) {
      // Update existing widget
      await ctx.db.patch(existingWidget._id, {
        appIds: args.appIds,
        order: args.order,
      });
      return existingWidget._id;
    } else {
      // Create new widget
      return await ctx.db.insert("userWidgets", {
        userId,
        widgetId: args.widgetId,
        appIds: args.appIds,
        order: args.order,
      });
    }
  },
});

// Delete a widget
export const deleteWidget = mutation({
  args: {
    widgetId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    const widget = await ctx.db
      .query("userWidgets")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("widgetId"), args.widgetId))
      .first();

    if (widget) {
      await ctx.db.delete(widget._id);
    }
  },
});

// Reorganize widgets (move apps between widgets)
export const reorganizeWidgets = mutation({
  args: {
    widgets: v.array(v.object({
      widgetId: v.string(),
      appIds: v.array(v.string()),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    // Delete all existing widgets for this user
    const existingWidgets = await ctx.db
      .query("userWidgets")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const widget of existingWidgets) {
      await ctx.db.delete(widget._id);
    }

    // Create new widgets with the provided configuration
    for (const widgetConfig of args.widgets) {
      await ctx.db.insert("userWidgets", {
        userId,
        widgetId: widgetConfig.widgetId,
        appIds: widgetConfig.appIds,
        order: widgetConfig.order,
      });
    }
  },
});
