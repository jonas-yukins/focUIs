#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetReloader, NSObject)

RCT_EXTERN_METHOD(reloadAllTimelines:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setSharedItem:(NSString *)key
                  value:(NSString *)value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end


