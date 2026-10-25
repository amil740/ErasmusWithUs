import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '../providers/auth-provider'
import { colors } from '../lib/theme'

export default function RootLayout() {
  return <AuthProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="match" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="opportunity/[id]" />
      <Stack.Screen name="students/[opportunityId]" />
      <Stack.Screen name="conversation/[id]" />
    </Stack>
  </AuthProvider>
}
