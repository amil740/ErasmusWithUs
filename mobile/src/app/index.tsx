import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../providers/auth-provider'
import { colors } from '../lib/theme'

export default function EntryScreen() {
  const { user, booting } = useAuth()
  if (booting) return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.green} size="large" /></View>
  return <Redirect href={user ? '/(tabs)' : '/auth'} />
}
