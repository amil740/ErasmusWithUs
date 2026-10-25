import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { colors } from '../../lib/theme'

const items = [
  { name: 'index', title: 'Explore', glyph: '⌕' },
  { name: 'universities', title: 'Universities', glyph: '▦' },
  { name: 'plans', title: 'My plans', glyph: '⌖' },
  { name: 'chat', title: 'Chat', glyph: '◌' },
  { name: 'profile', title: 'Profile', glyph: '◉' },
]

export default function TabsLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.greenDark,
    tabBarInactiveTintColor: '#83908C',
    tabBarStyle: { height: 66, paddingTop: 6, paddingBottom: 7, backgroundColor: '#FFFFFF', borderTopColor: colors.line },
    tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
  }}>
    {items.map((item) => <Tabs.Screen key={item.name} name={item.name} options={{
      title: item.title,
      tabBarIcon: ({ color, focused }) => <View style={{ width: 29, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: focused ? colors.mint : 'transparent' }}><Text style={{ fontSize: 20, color, lineHeight: 23, fontWeight: '700' }}>{item.glyph}</Text></View>,
    }} />)}
  </Tabs>
}
