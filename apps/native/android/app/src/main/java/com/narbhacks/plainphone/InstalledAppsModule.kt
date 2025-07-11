package com.narbhacks.plainphone

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject

class InstalledAppsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "InstalledAppsModule"
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val installedApps = packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
            
            val appsArray = JSONArray()
            
            for (appInfo in installedApps) {
                // Skip system apps that are not launchable
                if (appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0) {
                    continue
                }
                
                // Check if app is launchable
                val launchIntent = packageManager.getLaunchIntentForPackage(appInfo.packageName)
                if (launchIntent == null) {
                    continue
                }
                
                val appObject = JSONObject()
                appObject.put("id", appInfo.packageName)
                appObject.put("name", appInfo.loadLabel(packageManager).toString())
                appObject.put("packageName", appInfo.packageName)
                appObject.put("isSystemApp", (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0)
                
                // Try to get version info
                try {
                    val packageInfo = packageManager.getPackageInfo(appInfo.packageName, 0)
                    appObject.put("version", packageInfo.versionName ?: "")
                } catch (e: Exception) {
                    appObject.put("version", "")
                }
                
                appsArray.put(appObject)
            }
            
            promise.resolve(appsArray.toString())
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get installed apps: ${e.message}")
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(launchIntent)
                promise.resolve(true)
            } else {
                promise.reject("ERROR", "Cannot launch app: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to launch app: ${e.message}")
        }
    }

    @ReactMethod
    fun isAppInstalled(packageName: String, promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            promise.resolve(appInfo != null)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
} 