//
//  RNENVConfig.m
//  detective
//
//  Created by Thuc on 27/9/24.
//

#import <Foundation/Foundation.h>
#import "RNENVConfig.h"

/*
 http://43.203.213.15/
 export const login =  NativeModules.AppNativeModule.login ||  "https://tamtalk.com/login/"
 export const detective = NativeModules.AppNativeModule.detective ||  "https://tamtalk.com/detective/"
 export const message = NativeModules.AppNativeModule.message ||   "https://tamtalk.com/chat/"
 export const blog = NativeModules.AppNativeModule.blog ||  "https://tamtalk.com/blog/"
 export const more = NativeModules.AppNativeModule.more ||   "https://tamtalk.com/more/"
 export const domain =  NativeModules.AppNativeModule.domain ||  "https://tamtalk.com"

 */
@implementation AppNativeModule
RCT_EXPORT_MODULE();
- (NSDictionary *)constantsToExport
{
#if DEV
  
  return @{
    @"env": @"dev",
    @"login": @"http://43.203.234.150/login/",
    @"detective": @"http://43.203.213.150/detective/",
    @"message": @"http://43.203.213.150/chat/",
    @"more": @"http://43.203.213.150/more/",
    @"blog": @"http://43.203.213.150/blog/",
    @"domain": @"43.203.234.150",
    @"logout": @"http://43.203.234.150/logout",
 
  };
#else
  return @{
    @"env": @"prod",
    @"login": @"https://tamtalk.com/login/",
    @"detective": @"https://tamtalk.com/detective/",
    @"message": @"https://tamtalk.com/chat/",
    @"more": @"https://tamtalk.com/more/",
    @"blog": @"https://tamtalk.com/blog/",
    @"domain": @"tamtalk.com",
    @"logout": @"https://tamtalk.com/logout",
  };
  
#endif

}
+ (BOOL)requiresMainQueueSetup{
return YES;
}
@end
