//
//  NotificationService.swift
//  NotiService
//
//  Created by Thuc on 22/9/24.
//

import UserNotifications

import UserNotifications

class NotificationService: UNNotificationServiceExtension {

  var contentHandler: ((UNNotificationContent) -> Void)?
   var bestAttemptContent: UNMutableNotificationContent?

   override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {

       self.contentHandler = contentHandler
       bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
       if let bestAttemptContentStrong =  bestAttemptContent {
            let sound = UNNotificationSoundName(rawValue: "sound.caf")
            bestAttemptContent?.sound = UNNotificationSound(named: sound)
       }
       
   }
   
   override func serviceExtensionTimeWillExpire() {
       if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
           bestAttemptContent.sound = UNNotificationSound.default
           contentHandler(bestAttemptContent)
       }
   }


}

