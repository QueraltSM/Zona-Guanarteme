import PushNotification from 'react-native-push-notification';

export default class NotificationService {
  constructor(onNotification) {
    this.configure(onNotification);
    PushNotification.createChannel({
          channelId: "channel-id", // (required)
          channelName: "My channel", // (required)
          channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
          playSound: false, // (optional) default: true
          soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
          importance: 4, // (optional) default: 4. Int value of the Android notification importance
          vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
        },
        (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
      );
  }

  configure(onNotification) {
    PushNotification.configure({
      onNotification: onNotification,
      requestPermissions: Platform.OS === 'ios',
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      popInitialNotification: true,
    });
  }

  localNotification(title, message) {
    PushNotification.localNotification({
      title: title, 
      message: message, 
      channelId: "channel-id", 
    });
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif() {
    PushNotification.cancelLocalNotifications({id: ''+this.lastId});
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}