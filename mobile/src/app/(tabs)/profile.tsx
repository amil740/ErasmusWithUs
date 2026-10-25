import { useState } from 'react'
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Avatar, Button, Card, ErrorBanner, Field, Page, PageHeading, Pill } from '../../components/ui'
import { splitList } from '../../lib/format'
import { updateProfile } from '../../lib/api'
import { colors, radius } from '../../lib/theme'
import { useAuth } from '../../providers/auth-provider'

export default function ProfileScreen() {
  const { user, token, updateUser, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [homeUniversity, setHomeUniversity] = useState(user?.homeUniversity ?? '')
  const [country, setCountry] = useState(user?.country ?? '')
  const [studyField, setStudyField] = useState(user?.studyField ?? '')
  const [level, setLevel] = useState(user?.level ?? '')
  const [gpa, setGpa] = useState(user?.gpa?.toString() ?? '')
  const [intake, setIntake] = useState(user?.intake ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [preferredCountries, setPreferredCountries] = useState(user?.preferredCountries.join(', ') ?? '')
  const [languages, setLanguages] = useState(user?.languages.join(', ') ?? '')
  const [visible, setVisible] = useState(user?.communityVisible ?? false)
  const [roommateSearch, setRoommateSearch] = useState(user?.roommateSearch ?? false)
  const [photo, setPhoto] = useState<string | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const photoUri = photo === undefined ? user?.profilePhotoDataUrl : photo

  async function choosePhoto() {
    setError('')
    try {
      const permission = await requestMediaLibraryPermissionsAsync()
      if (!permission.granted) throw new Error('Allow photo library access to choose a profile picture.')
      const picked = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 })
      if (picked.canceled || !picked.assets[0]) return
      setPhotoBusy(true)
      const firstPass = await manipulateAsync(picked.assets[0].uri, [{ resize: { width: 512, height: 512 } }], { compress: 0.58, format: SaveFormat.JPEG, base64: true })
      if (!firstPass.base64) throw new Error('This image could not be prepared. Choose another photo.')
      let base64 = firstPass.base64
      if (base64.length * 0.75 >= 90_000) {
        const secondPass = await manipulateAsync(picked.assets[0].uri, [{ resize: { width: 420, height: 420 } }], { compress: 0.34, format: SaveFormat.JPEG, base64: true })
        base64 = secondPass.base64 ?? ''
      }
      if (!base64 || base64.length * 0.75 >= 90_000) throw new Error('That photo is too large to upload. Try a smaller image.')
      setPhoto(`data:image/jpeg;base64,${base64}`)
      setNotice('Profile picture ready. Save your profile to publish it.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not choose that photo.')
    } finally {
      setPhotoBusy(false)
    }
  }

  async function save() {
    if (!token) return
    setBusy(true)
    setError('')
    setNotice('')
    const parsedGpa = gpa.trim() ? Number(gpa) : null
    if (parsedGpa !== null && !Number.isFinite(parsedGpa)) {
      setBusy(false)
      setError('Enter a valid GPA from 0 to 4, or leave it blank.')
      return
    }
    try {
      const payload = {
        displayName: displayName.trim(),
        homeUniversity: homeUniversity.trim() || null,
        country: country.trim() || null,
        studyField: studyField.trim() || null,
        level: level.trim() || null,
        gpa: parsedGpa,
        intake: intake.trim() || null,
        bio: bio.trim() || null,
        preferredCountries: splitList(preferredCountries),
        languages: splitList(languages),
        communityVisible: visible,
        roommateSearch,
        ...(photo !== undefined && photo !== null ? { profilePhotoDataUrl: photo } : {}),
        ...(photo === null ? { removeProfilePhoto: true } : {}),
      }
      const saved = await updateProfile(token, payload)
      updateUser(saved)
      setPhoto(undefined)
      setNotice('Your profile is saved. Other students will see these details when visibility is on.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your profile.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await signOut()
    router.replace('/auth')
  }

  return <Page>
    <PageHeading eyebrow="The details that shape your exchange" title="My profile" subtitle="Help the app find relevant destinations and help your future exchange circle get to know you." />
    <Card style={styles.identityCard}>
      <View style={styles.avatarWrap}><Avatar uri={photoUri} name={displayName} size={72} /><Pressable accessibilityRole="button" onPress={choosePhoto} disabled={photoBusy} style={styles.camera}><Text style={styles.cameraText}>{photoBusy ? '…' : '＋'}</Text></Pressable></View>
      <View style={styles.identityCopy}><Text style={styles.identityName}>{displayName || 'Your name'}</Text><Text style={styles.identityEmail}>{user?.email}</Text><Pill>{user?.emailVerified ? 'EMAIL VERIFIED' : 'EMAIL NOT VERIFIED'}</Pill></View>
    </Card>
    <View style={styles.photoActions}><Pressable onPress={choosePhoto} disabled={photoBusy}><Text style={styles.photoLink}>{photoBusy ? 'Preparing photo...' : 'Change profile picture'}</Text></Pressable>{photoUri ? <Pressable onPress={() => { setPhoto(null); setNotice('Save your profile to remove the picture.') }}><Text style={styles.removeLink}>Remove</Text></Pressable> : null}</View>

    <Card><Text style={styles.sectionTitle}>About you</Text><Field label="DISPLAY NAME" value={displayName} onChangeText={setDisplayName} placeholder="Your name" autoCapitalize="words" maxLength={80} /><Field label="HOME UNIVERSITY" value={homeUniversity} onChangeText={setHomeUniversity} placeholder="Where you study now" maxLength={160} /><Field label="A SHORT INTRO" value={bio} onChangeText={setBio} placeholder="What are you looking forward to?" maxLength={320} multiline /></Card>
    <Card><Text style={styles.sectionTitle}>Your study profile</Text><Field label="HOME COUNTRY" value={country} onChangeText={setCountry} placeholder="e.g. Azerbaijan" /><Field label="FIELD OF STUDY" value={studyField} onChangeText={setStudyField} placeholder="e.g. Computer Science" /><View style={styles.twoColumns}><Field label="DEGREE LEVEL" value={level} onChangeText={setLevel} placeholder="Bachelor, Master..." wrapperStyle={styles.half} /><Field label="GPA (0–4)" value={gpa} onChangeText={setGpa} placeholder="3.4" keyboardType="decimal-pad" wrapperStyle={styles.half} /></View><Field label="EXCHANGE INTAKE" value={intake} onChangeText={setIntake} placeholder="Autumn 2026/27" maxLength={40} /><Field label="PREFERRED DESTINATIONS" value={preferredCountries} onChangeText={setPreferredCountries} placeholder="Finland, Germany, Spain" /><Text style={styles.helper}>Separate destinations with commas.</Text><Field label="LANGUAGES" value={languages} onChangeText={setLanguages} placeholder="English, German" /><Text style={styles.helper}>Separate languages with commas.</Text></Card>
    <Card style={styles.visibilityCard}>
      <View style={styles.visibilityTitleRow}><View style={{ flex: 1, gap: 4 }}><Text style={styles.sectionTitle}>Exchange community</Text><Text style={styles.visibilityBody}>Let students with the same university and term find your profile and message you.</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: visible }} onPress={() => setVisible((current) => !current)} style={[styles.toggle, visible && styles.toggleOn]}><View style={[styles.toggleDot, visible && styles.toggleDotOn]} /></Pressable></View>
      <View style={styles.visibilityNote}><Text style={styles.visibilityNoteText}>{visible ? 'Visible to students who share one of your exchange plans. Your email and GPA stay private.' : 'Hidden from other students. Turn this on when you are ready to meet your exchange circle.'}</Text></View>
      <View style={styles.visibilityTitleRow}><View style={{ flex: 1, gap: 4 }}><Text style={styles.sectionTitle}>Looking for a roommate</Text><Text style={styles.visibilityBody}>Signal that you are open to shared housing with students on the same destination and intake.</Text></View><Pressable accessibilityRole="switch" accessibilityState={{ checked: roommateSearch }} onPress={() => setRoommateSearch((current) => !current)} style={[styles.toggle, roommateSearch && styles.toggleOn]}><View style={[styles.toggleDot, roommateSearch && styles.toggleDotOn]} /></Pressable></View>
      <View style={styles.visibilityNote}><Text style={styles.visibilityNoteText}>{roommateSearch ? 'Your matching students will see that you are open to sharing housing.' : 'This is optional and can be changed at any time.'}</Text></View>
    </Card>

    {error ? <ErrorBanner message={error} /> : null}
    {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    <Button label="Save profile" onPress={save} loading={busy} disabled={photoBusy} />
    <Button label="Sign out" onPress={logout} variant="outline" />
    <Text style={styles.version}>ERASMUSWITHUS  ·  STUDENT COMMUNITY</Text>
  </Page>
}

const styles = StyleSheet.create({
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatarWrap: { position: 'relative' },
  camera: { position: 'absolute', width: 25, height: 25, borderRadius: 14, right: -2, bottom: -2, backgroundColor: colors.greenDark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  cameraText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, lineHeight: 20, marginTop: -2 },
  identityCopy: { flex: 1, gap: 5 },
  identityName: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  identityEmail: { color: colors.muted, fontSize: 11 },
  photoActions: { flexDirection: 'row', gap: 17, justifyContent: 'center', marginTop: -8 },
  photoLink: { color: colors.green, fontSize: 11, fontWeight: '800', padding: 4 },
  removeLink: { color: colors.danger, fontSize: 11, fontWeight: '700', padding: 4 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  twoColumns: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  helper: { color: colors.muted, fontSize: 10, marginTop: -6 },
  visibilityCard: { backgroundColor: '#EFF5EF', borderColor: '#DFE9E0' },
  visibilityTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  visibilityBody: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  toggle: { width: 47, height: 27, borderRadius: radius.pill, padding: 3, backgroundColor: '#D6DEDA', justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.green },
  toggleDot: { width: 21, height: 21, borderRadius: 11, backgroundColor: '#FFFFFF', alignSelf: 'flex-start' },
  toggleDotOn: { alignSelf: 'flex-end' },
  visibilityNote: { padding: 10, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.72)' },
  visibilityNoteText: { color: colors.greenDark, fontSize: 10, lineHeight: 15 },
  notice: { color: colors.greenDark, backgroundColor: colors.mint, padding: 12, borderRadius: 13, fontSize: 12, lineHeight: 18 },
  version: { color: '#8B9691', textAlign: 'center', fontSize: 8, letterSpacing: 1.1, fontWeight: '800', paddingTop: 4 },
})
