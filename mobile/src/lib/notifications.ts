import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function getExpoPushToken() {
  if (Platform.OS === 'web') return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: 5,
    })
  }

  const current = await Notifications.getPermissionsAsync()
  const permission = current.status === 'granted'
    ? current
    : await Notifications.requestPermissionsAsync()
  if (permission.status !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  if (!projectId) return null
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data
}
