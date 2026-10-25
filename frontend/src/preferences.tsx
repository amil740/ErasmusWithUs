import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'en' | 'es' | 'de' | 'fr' | 'pt' | 'it' | 'zh' | 'ar'
export type Theme = 'light' | 'dark'

export const interfaceLanguages: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
]

export function getLanguageLocale(language: Language) {
  return language === 'es' ? 'es-ES'
    : language === 'de' ? 'de-DE'
      : language === 'fr' ? 'fr-FR'
        : language === 'pt' ? 'pt-PT'
          : language === 'it' ? 'it-IT'
            : language === 'zh' ? 'zh-CN'
              : language === 'ar' ? 'ar-SA'
                : 'en-GB'
}

const translations: Record<string, string> = {
  'Workspace': 'İş sahəsi', 'Your journey': 'Səyahətiniz', 'Profile progress': 'Profilin tamamlanması',
  'Your Erasmus profile is ready.': 'Erasmus profiliniz hazırdır.',
  'Complete your profile to get better matches and meet students.': 'Daha uyğun təkliflər və tələbələrlə tanışlıq üçün profilinizi tamamlayın.',
  'Create an account to build your Erasmus profile.': 'Erasmus profilinizi yaratmaq üçün hesab açın.',
  'Improve profile': 'Profili tamamla', 'Guest explorer': 'Qonaq istifadəçi', 'Account settings': 'Hesab ayarları',
  'Verify email': 'E-poçtu təsdiqlə', 'Set up account': 'Hesab yarat', 'Close menu': 'Menyunu bağla', 'Open menu': 'Menyunu aç',
  'Open shortlist': 'Seçilmişlərə bax', 'Sign in': 'Daxil ol', 'Sign in or verify email': 'Daxil ol və ya e-poçtu təsdiqlə',
  'Discover': 'Kəşf et', 'Universities': 'Universitetlər', 'Find my match': 'Mənə uyğun olanı tap',
  'Community': 'Tələbə icması', 'Compare': 'Müqayisə', 'Shortlist': 'Seçilmişlər', 'Planner': 'Planlayıcı', 'My account': 'Hesabım',
  '2026 / 27 exchange catalogue': '2026 / 27 mübadilə kataloqu',
  "Find the place": 'Sənə uyğun yeri', "you'll grow into.": 'tap və inkişaf et.',
  'Explore exchange opportunities across Europe, then find the ones that fit your degree, language, budget, and ambitions.': 'Avropadakı mübadilə imkanlarına bax, sonra ixtisasına, dilinə, büdcənə və hədəflərinə uyğun olanı seç.',
  'Explore universities': 'Universitetləri araşdır', 'Browse {count} Erasmus destinations, compare study options, and check official sources.': '{count} Erasmus istiqamətinə bax, təhsil seçimlərini müqayisə et və rəsmi mənbələri yoxla.',
  'Browse universities': 'Universitetlərə bax', 'Matching...': 'Uyğunluq axtarılır...', 'destinations indexed': 'istiqamət',
  'countries indexed': 'ölkə', 'need source review': 'mənbə yoxlanmalıdır', 'Source and review status shown per listing': 'Hər elan üzrə mənbə və yoxlama statusu göstərilir',
  'MY ACCOUNT · VERIFIED': 'HESABIM · TƏSDİQLƏNİB', 'Add your home university': 'Öz universitetinizi əlavə edin',
  'Add your study field': 'İxtisasınızı əlavə edin', 'Edit profile': 'Profili redaktə et', 'HOME UNIVERSITY': 'ÖZ UNİVERSİTETİ',
  'PLANNED INTAKE': 'PLANLAŞDIRILAN MÜBADİLƏ', 'STUDY PROFILE': 'TƏHSİL PROFİLİ', 'COMMUNITY PROFILE': 'İCMA PROFİLİ',
  'Not added': 'Əlavə edilməyib', 'Not selected': 'Seçilməyib', 'Not completed': 'Tamamlanmayıb',
  'Visible to matching students': 'Uyğun tələbələrə görünür', 'Private': 'Gizli',
  'Add a short introduction so students with the same Erasmus plans know a little about you.': 'Eyni Erasmus planları olan tələbələrin sizi tanıması üçün qısa təqdimat əlavə edin.',
  'YOUR ERASMUS PROFILE': 'ERASMUS PROFİLİNİZ', 'A complete profile helps students with similar plans find you.': 'Tam profil oxşar planları olan tələbələrin sizi tapmasına kömək edir.',
  'Complete your profile': 'Profilinizi tamamlayın', 'ERASMUS STUDENT EXPERIENCES': 'ERASMUS TƏLƏBƏLƏRİNİN TƏCRÜBƏLƏRİ',
  'Learn from students who have been there.': 'Ora gedib görmüş tələbələrdən öyrənin.',
  'Read student stories': 'Tələbə təcrübələrini oxuyun',
  'Read real student-submitted stories, including self-reported alumni experiences, about applications, courses, housing and everyday life.': 'Müraciət, dərslər, yaşayış və gündəlik həyat barədə tələbələrin paylaşdığı real təcrübələri, o cümlədən məzunların özlərinin bildirdiyi rəyləri oxuyun.',
  'Housing': 'Yaşayış', 'Start searching early and confirm the lease, deposit and commute before paying.': 'Axtarışa erkən başlayın, ödəniş etməzdən əvvəl müqaviləni, depoziti və gediş-gəlişi dəqiqləşdirin.',
  'Courses': 'Dərslər', 'Check teaching language, course availability and credit recognition with both universities.': 'Tədris dilini, dərslərin mövcudluğunu və kreditlərin tanınmasını hər iki universitetlə dəqiqləşdirin.',
  'Plan for the arrival deposit and first-month costs; a grant may not cover every expense.': 'Depozit və ilk ayın xərclərini əvvəlcədən planlaşdırın; qrant bütün xərcləri ödəməyə bilər.',
  'Paperwork': 'Sənədləşmə',
  'FEATURED CAMPUSES': 'SEÇİLMİŞ KAMPUSLAR', 'Explore universities by QS ranking.': 'Universitetləri QS sıralamasına görə araşdırın.',
  'QS WUR 2027': 'QS WUR 2027', 'Photo by': 'Şəkil müəllifi:',
  'Wikimedia Commons': 'Wikimedia Commons',
  'QS World University Rankings 2027. Rankings are one comparison point, not a measure of exchange eligibility. Photos are linked to their Wikimedia Commons source.': 'QS World University Rankings 2027. Sıralama müqayisə üçün göstəricilərdən biridir, mübadilə uyğunluğunu müəyyən etmir. Şəkillərin Wikimedia Commons mənbəyinə keçid verilib.',
  'What exchange students wish they knew earlier.': 'Mübadilə tələbələrinin əvvəlcədən bilməyi arzuladıqları.',
  'Practical reminders for planning your exchange. Read student-submitted stories after signing in.': 'Mübadiləni planlamaq üçün praktiki tövsiyələr. Tələbə təcrübələrini giriş etdikdən sonra oxuyun.',
  'Start looking early. Check the contract, deposit, location and commute before you transfer money.': 'Axtarışa erkən başlayın. Pul köçürməzdən əvvəl müqaviləni, depoziti, ünvanı və gediş-gəlişi yoxlayın.',
  'Confirm course availability, teaching language and credit recognition with both universities.': 'Dərslərin mövcudluğunu, tədris dilini və kreditlərin tanınmasını hər iki universitetlə dəqiqləşdirin.',
  'Plan for arrival and deposit costs; your grant may not cover every monthly expense.': 'Köçmə və depozit xərclərini də planlayın; qrant bütün aylıq xərcləri ödəməyə bilər.',
  'Keep nomination, learning agreement, insurance and visa dates on one checklist.': 'Namizədlik, təhsil müqaviləsi, sığorta və viza tarixlərini bir siyahıda izləyin.',
  'QS WORLD UNIVERSITY RANKINGS 2027': 'QS WORLD UNIVERSITY RANKINGS 2027',
  'A first look at popular campuses.': 'Məşhur kampuslara ilk baxış.',
  'Rankings are one comparison point, not a measure of Erasmus eligibility.': 'Sıralama müqayisə göstəricilərindən biridir, Erasmus uyğunluğunu müəyyən etmir.',
  'Ready to plan your exchange?': 'Mübadiləni planlamağa hazırsınız?',
  'Sign in to save destinations, see student stories and build your profile.': 'İstiqamətləri saxlamaq, tələbə təcrübələrini görmək və profil yaratmaq üçün daxil olun.',
  'Log in to continue': 'Davam etmək üçün daxil olun',
  'Your Erasmus profile starts here.': 'Erasmus profiliniz buradan başlayır.',
  'Sign in and verify your email to add your home university, photo, study details, and exchange plans.': 'Öz universitetinizi, şəklinizi, təhsil məlumatlarını və mübadilə planlarınızı əlavə etmək üçün daxil olun və e-poçtunuzu təsdiqləyin.',
  'YOUR SHORTLIST': 'SEÇİLMİŞ İSTİQAMƏTLƏR', 'DISCOVER OPPORTUNITIES': 'MÜBADİLƏ İMKANLARINI KƏŞF ET',
  'Your saved destinations.': 'Yadda saxladığınız istiqamətlər.', 'Where could you go?': 'Hara gedə bilərsiniz?',
  'View all destinations': 'Bütün istiqamətlərə bax', 'Search university, city, or subject...': 'Universitet, şəhər və ya ixtisas axtar...',
  'Filters': 'Filtrlər', 'Recommended': 'Tövsiyə edilən', 'Grant: high to low': 'Qrant: çoxdan aza', 'Deadline: soonest': 'Son tarix: yaxından uzağa',
  'Country': 'Ölkə', 'All countries': 'Bütün ölkələr', 'Degree level': 'Təhsil pilləsi', 'All levels': 'Bütün pillələr',
  'Clear filters': 'Filtrləri təmizlə', 'Loading destinations...': 'İstiqamətlər yüklənir...', 'opportunities': 'imkan',
  'Your shortlist is empty': 'Seçilmiş istiqamət yoxdur', 'Use the bookmark icon to save a destination.': 'İstiqaməti saxlamaq üçün əlfəcin işarəsinə toxunun.',
  'No destinations found': 'İstiqamət tapılmadı', 'Try clearing a filter or searching for another city.': 'Filtri silin və ya başqa şəhər axtarın.',
  'A SHORTCUT TO THE RIGHT FIT': 'SİZƏ UYĞUN SEÇİMƏ QISA YOL', 'Your next chapter': 'Yeni mərhələniz',
  'YOUR NEXT STEP': 'NÖVBƏTİ ADDIMINIZ', 'Start with a profile, not a random search.': 'Təsadüfi axtarışla yox, profilinizlə başlayın.', 'Complete your profile to make every recommendation more personal.': 'Hər tövsiyəni fərdiləşdirmək üçün profilinizi tamamlayın.', 'Save two destinations so you can compare them side by side.': 'Yan-yana müqayisə etmək üçün iki istiqaməti yadda saxlayın.', 'Compare your shortlist, then start an application tracker.': 'Seçimlərinizi müqayisə edin, sonra müraciət izləyicisi yaradın.', 'Add your field, GPA, language, budget and preferred countries to get evidence-based matches.': 'Məlumata əsaslanan uyğunluq üçün ixtisasınızı, GPA-nızı, dili, büdcəni və üstün ölkələri əlavə edin.', 'Your study field, level, GPA and language profile improve the quality of the shortlist.': 'İxtisas, təhsil pilləsi, GPA və dil profiliniz seçim siyahısını yaxşılaşdırır.', 'Saved choices unlock comparison, budgeting and a clearer decision.': 'Yadda saxlanılan seçimlər müqayisə, büdcə və daha aydın qərar imkanı yaradır.', 'The coordinator still confirms the agreement, nomination and credit recognition.': 'Razılaşmanı, namizədliyi və kreditlərin tanınmasını yenə koordinator təsdiqləyir.', 'Build my profile': 'Profilimi yarat', 'Browse destinations': 'İstiqamətlərə bax', 'Compare shortlist': 'Seçimləri müqayisə et',
  'is closer than you think.': 'düşündüyünüzdən yaxındır.',
  'Our matching engine weighs your field, GPA, language, budget, and what you really enjoy so the suggestions become personal rather than generic.': 'Uyğunluq sistemi ixtisasınızı, GPA göstəricinizi, dilləri, büdcəni və maraqlarınızı nəzərə alaraq fərdi təkliflər hazırlayır.',
  'Calculating...': 'Hesablanır...', 'Build my shortlist': 'Seçilmişlərimi yarat', 'best match': 'ən uyğun',
  'YOUR MATCH RESULTS': 'UYĞUNLUQ NƏTİCƏLƏRİ', 'Start with these.': 'Bunlardan başlayın.',
  'The score explains fit, not eligibility. Your home university coordinator must confirm the bilateral agreement and nomination.': 'Bal uyğunluğu göstərir, qəbul zəmanəti vermir. İkitərəfli razılaşma və namizədliyi öz universitetinizin koordinatoru təsdiqləməlidir.',
  'Fits your profile': 'Profilinizə uyğundur', 'Save match': 'Uyğunluğu yadda saxla',
  'Your next step': 'Növbəti addımınız', 'Complete your study field, degree level, and GPA to check the listed requirements.': 'Göstərilən tələbləri yoxlamaq üçün ixtisasınızı, təhsil pillənizi və GPA-nızı tamamlayın.', 'Review the failed requirement checks before saving this destination.': 'Bu istiqaməti saxlamazdan əvvəl uğursuz tələb yoxlamalarını nəzərdən keçirin.', 'Confirm the bilateral agreement, course language, and nomination with your home university.': 'İkitərəfli razılaşmanı, tədris dilini və namizədliyi öz universitetinizlə təsdiqləyin.',
  'Tell us what suits you.': 'Sizə nə uyğun olduğunu seçin.',
  'Pick your preferences below to get a personalised shortlist without typing free-form answers.': 'Fərdi seçim siyahısı üçün aşağıdakı üstünlüklərinizi seçin.',
  'Home country': 'Yaşadığınız ölkə', 'Select country': 'Ölkə seçin', 'Study field': 'İxtisas sahəsi', 'GPA': 'GPA',
  'Monthly budget (EUR)': 'Aylıq büdcə (EUR)', 'Preferred countries': 'Üstün tutulan ölkələr', 'Languages': 'Dillər',
  'All study fields': 'Bütün ixtisaslar', 'Teaching language': 'Tədris dili', 'All languages': 'Bütün dillər', 'Study fields': 'İxtisas sahələri', 'Teaching languages': 'Tədris dilləri',
  'What you like': 'Maraqlandığınız xüsusiyyətlər', 'What you dislike': 'İstəmədiyiniz xüsusiyyətlər', 'Find best fit': 'Ən uyğun variantı tap',
  'MY ERASMUS PROFILE': 'ERASMUS PROFİLİM', 'Your account, built around your exchange.': 'Mübadilə planınıza uyğun hesabınız.',
  'Set up your study profile and choose what other students planning the same university can see.': 'Təhsil profilinizi yaradın və eyni universiteti planlayan tələbələrin görə biləcəyi məlumatları seçin.',
  'Profile photo': 'Profil şəkli', 'Profile preview': 'Profil şəklinə baxış',
  'JPEG after upload. Your email and GPA stay private from other students.': 'Şəkil yüklənərkən JPEG formatına çevrilir. E-poçt və GPA digər tələbələrə görünmür.',
  'Choose photo': 'Şəkil seç', 'Remove': 'Sil', 'About you': 'Haqqınızda', 'Used for your profile and university matching.': 'Profiliniz və universitet uyğunluğu üçün istifadə olunur.',
  'Display name': 'Görünən ad', 'Home university': 'Öz universitetiniz', 'Current GPA': 'Cari GPA', 'Planned Erasmus intake': 'Planlaşdırılan Erasmus dövrü',
  'Short introduction': 'Qısa təqdimat', 'Your current university': 'Hazırda oxuduğunuz universitet',
  'What are you studying and what are you looking forward to?': 'Nə oxuyursunuz və mübadilədə nəyi səbirsizliklə gözləyirsiniz?',
  'Show my profile to matching students': 'Profilimi uyğun tələbələrə göstər',
  'Students with the same destination and intake can see your photo, display name, home university, field and introduction. Your email and GPA are never shown.': 'Eyni istiqamət və mübadilə dövrünü seçən tələbələr şəklinizi, adınızı, universitetinizi, ixtisasınızı və təqdimatınızı görə bilər. E-poçt və GPA heç vaxt göstərilmir.',
  'Saving…': 'Yadda saxlanılır…', 'Save my Erasmus profile': 'Erasmus profilimi yadda saxla',
  'ERASMUSWITHUS ACCOUNT': 'ERASMUSWITHUS HESABI', 'Welcome back.': 'Xoş gəlmisiniz.', 'Start your journey.': 'Səyahətinizə başlayın.',
  'Reset your password.': 'Şifrənizi yeniləyin.', 'Check your email.': 'E-poçtunuzu yoxlayın.',
  'Save destinations, build your profile, and keep your Erasmus plan in one place.': 'İstiqamətləri yadda saxlayın, profil yaradın və Erasmus planınızı bir yerdə saxlayın.',
  'Enter the six-letter code we sent to your email before continuing.': 'Davam etmək üçün e-poçtunuza göndərilən altı simvollu kodu daxil edin.',
  'Enter the reset code from your email and choose a new password.': 'E-poçtunuza göndərilən yeniləmə kodunu daxil edin və yeni şifrə seçin.',
  'Request a secure password reset code for your account.': 'Hesabınız üçün təhlükəsiz şifrə yeniləmə kodu istəyin.',
  'Name': 'Ad', 'Your name': 'Adınız', 'Email': 'E-poçt', 'Password': 'Şifrə', 'At least 8 characters': 'Ən azı 8 simvol',
  'Create account': 'Hesab yarat', 'Send reset code': 'Yeniləmə kodu göndər', 'Reset code': 'Yeniləmə kodu',
  'Paste the code from your email': 'E-poçtdakı kodu bura daxil edin', 'New password': 'Yeni şifrə', 'Set new password': 'Yeni şifrəni təyin et',
  'Six-letter verification code': 'Altı simvollu təsdiq kodu', 'Verify and continue': 'Təsdiqlə və davam et',
  'Resend verification code': 'Təsdiq kodunu yenidən göndər', 'Need an account? Create one': 'Hesabınız yoxdur? Yaradın',
  'Already have an account? Sign in': 'Artıq hesabınız var? Daxil olun', 'Forgot password?': 'Şifrəni unutmusunuz?', 'Back to sign in': 'Girişə qayıt',
  'Close': 'Bağla', 'Save to shortlist': 'Seçilmişlərə əlavə et', 'Remove from shortlist': 'Seçilmişlərdən sil',
  'Verified source': 'Mənbə təsdiqlənib', 'Needs review': 'Yoxlama tələb olunur', 'Planning data only: verify GPA, grant, deadline, and course availability with the official source and your coordinator.': 'Yalnız planlama məlumatıdır: GPA, qrantı, son tarixi və fənlərin mövcudluğunu rəsmi mənbə və koordinatorunuzla təsdiqləyin.', 'MIN. GPA': 'MİN. GPA', 'GRANT / MONTH': 'AYLIQ QRANT',
  'DEADLINE': 'SON TARİX', 'EST. MONTHLY TOTAL': 'TƏXMİNİ AYLIQ XƏRC', 'Rent + basics': 'Kirayə + əsas xərclər',
  'GRANT COVERS': 'QRANTIN ÖDƏDİYİ HİSSƏ', 'Most core costs': 'Əsas xərclərin çoxu', 'Plan extra savings': 'Əlavə büdcə planlayın',
  'Hide student guide': 'Tələbə bələdçisini gizlət', 'See city, application & housing guide': 'Şəhər, müraciət və yaşayış bələdçisi',
  'Which city fits?': 'Hansı şəhər uyğundur?', 'Does the grant cover it?': 'Qrant xərcləri qarşılayırmı?',
  'Can your field apply?': 'İxtisasınızla müraciət edə bilərsinizmi?', 'Common documents to prepare': 'Hazırlanmalı sənədlər',
  'City context': 'Şəhər haqqında', 'Affordable housing near {city}': '{city} yaxınlığında münasib yaşayış',
  'View university source': 'Universitetin mənbəyinə bax', 'Last checked': 'Son yoxlama',
  'COMPARE DESTINATIONS': 'İSTİQAMƏTLƏRİ MÜQAYİSƏ ET', 'Compare your saved choices.': 'Yadda saxladığınız seçimləri müqayisə edin.',
  'Save at least two destinations to compare GPA requirements, grants, monthly costs, and deadlines side by side.': 'GPA tələblərini, qrantları, aylıq xərcləri və son tarixləri müqayisə etmək üçün ən azı iki istiqamət saxlayın.',
  'Discover destinations': 'İstiqamətləri kəşf et', 'Details': 'Təfərrüatlar', 'Minimum GPA': 'Minimum GPA', 'Grant / month': 'Aylıq qrant',
  'Estimated monthly cost': 'Təxmini aylıq xərc', 'Deadline': 'Son tarix', 'Source status': 'Mənbə statusu', 'Verified': 'Təsdiqlənib',
  'APPLICATION PLANNER': 'MÜRACİƏT PLANI', 'Keep your exchange plan moving.': 'Mübadilə planınızı irəli aparın.',
  'Review exchange requirements with your coordinator': 'Mübadilə tələblərini koordinatorunuzla dəqiqləşdirin',
  'Prepare transcript and language certificate': 'Transkript və dil sertifikatını hazırlayın',
  'Submit the Learning Agreement and application': 'Təhsil müqaviləsini və müraciəti göndərin',
  'Arrange accommodation, insurance, and travel': 'Yaşayış, sığorta və səfəri təşkil edin',
  'steps complete. Your checklist is saved in this browser.': 'addım tamamlanıb. Siyahı bu brauzerdə saxlanılır.',
  'APPLICATION TRACKER': 'MÜRACİƏT İZLƏYİCİSİ', 'Follow every university application in one place.': 'Hər universitet müraciətini bir yerdə izləyin.',
  'Sign in and verify your email to save your stages and checklist across devices.': 'Mərhələ və siyahını cihazlar arasında saxlamaq üçün daxil olun və e-poçtunuzu təsdiqləyin.',
  'Track each destination and intake separately. Your changes are saved to your account.': 'Hər istiqamət və semestri ayrıca izləyin. Dəyişikliklər hesabınızda saxlanılır.',
  'Track this application': 'Bu müraciəti izlə', 'No applications tracked yet': 'Hələ izlənən müraciət yoxdur',
  'Add a university above to start your first application checklist.': 'İlk müraciət siyahısını yaratmaq üçün yuxarıdan universitet əlavə edin.',
  'Application stage': 'Müraciət mərhələsi', 'Checklist progress': 'Siyahı üzrə irəliləyiş', 'Last saved': 'Son saxlanma',
  'Confirm exchange agreement with my coordinator': 'Mübadilə razılaşmasını koordinatorumla dəqiqləşdirim',
  'Check eligibility and course language': 'Uyğunluğu və dərs dilini yoxlayım',
  'Submit my university nomination': 'Universitet namizədliyimi göndərim',
  'Submit the application and learning agreement': 'Müraciəti və təhsil müqaviləsini göndərim',
  'Arrange housing, insurance, and travel': 'Yaşayış, sığorta və səfəri təşkil edim',
  'Considering': 'Nəzərdən keçirirəm', 'Preparing': 'Hazırlaşıram', 'Submitted': 'Göndərilib', 'Nominated': 'Namizəd göstərilib',
  'Accepted': 'Qəbul olunub', 'Completed': 'Tamamlanıb', 'Tracker update saved.': 'İzləyici yeniləməsi saxlanıldı.',
  'Application tracker created and saved to your account.': 'Müraciət izləyicisi yaradıldı və hesabınızda saxlanıldı.',
  'Could not load your application plans.': 'Müraciət planlarınızı yükləmək mümkün olmadı.',
  'Could not create your application tracker.': 'Müraciət izləyicisini yaratmaq mümkün olmadı.',
  'Could not save this tracker update.': 'İzləyici yeniləməsini saxlamaq mümkün olmadı.',
  'I am looking for a roommate': 'Otaq yoldaşı axtarıram',
  'Let students going to the same university and intake find you for shared housing. This is optional and does not reveal your contact details.': 'Eyni universitetə və semestrə gedən tələbələr ortaq yaşayış üçün sizi tapa bilsin. Bu seçimlidir və əlaqə məlumatlarınızı göstərmir.',
  'Only show students looking for a roommate': 'Yalnız otaq yoldaşı axtaranları göstər',
  'Open to sharing housing': 'Ortaq yaşayışa açıqdır',
  'One-time arrival costs': 'Birdəfəlik köçmə xərcləri', 'My first-month funds': 'İlk ay üçün vəsaitim',
  'One-time arrival and deposit costs': 'Birdəfəlik köçmə və depozit xərcləri',
  'Estimated first-month amount to cover after grant': 'Qrantdan sonra ilk ay üçün qarşılanmalı məbləğ',
  'Your funds after first-month costs': 'İlk ay xərclərindən sonra qalan vəsaitiniz',
  'Export calendar': 'Təqvimi ixrac et',
  'ALUMNI Q&A': 'MƏZUNLARA SUAL-CAVAB', 'Ask someone who has been there.': 'Ora gedib görmüş tələbədən soruşun.',
  'Ask about applications, courses, housing or daily life. Alumni labels are self-reported by students.': 'Müraciət, dərslər, yaşayış və gündəlik həyat barədə soruşun. Məzun statusunu tələbələr özləri bildirir.',
  'What would you like to ask about this university?': 'Bu universitet barədə nə soruşmaq istərdiniz?', 'Ask question': 'Sual ver',
  'Sign in and verify your email to ask or answer a question.': 'Sual vermək və cavablandırmaq üçün daxil olun və e-poçtunuzu təsdiqləyin.',
  'Loading questions…': 'Suallar yüklənir…', 'No questions yet': 'Hələ sual yoxdur',
  'Start the conversation for this destination.': 'Bu istiqamət üçün söhbətə başlayın.', 'Share a helpful answer…': 'Faydalı cavab paylaşın…',
  'Post answer': 'Cavabı paylaş', 'Could not post your question.': 'Sualı paylaşmaq mümkün olmadı.',
  'Could not send your answer.': 'Cavabı göndərmək mümkün olmadı.',
  'Suggest a catalogue correction': 'Kataloq düzəlişi təklif et', 'Close correction form': 'Düzəliş formasını bağla',
  'Sign in and verify your email to suggest an update.': 'Yeniləmə təklif etmək üçün daxil olun və e-poçtunuzu təsdiqləyin.',
  'Which detail needs updating?': 'Hansı məlumat yenilənməlidir?', 'Correct value': 'Düzgün məlumat',
  'Official source URL': 'Rəsmi mənbənin URL-i', 'Why does this need updating?': 'Bu məlumat niyə yenilənməlidir?',
  'Enter the verified value': 'Təsdiqlənmiş məlumatı daxil edin', 'A reviewer checks your source before the catalogue changes.': 'Kataloq dəyişməzdən əvvəl rəyçi mənbəni yoxlayır.',
  'Send for review': 'Yoxlamaya göndər', 'Sending…': 'Göndərilir…',
  'Thanks. Your source-backed correction is waiting for a review.': 'Təşəkkürlər. Mənbəli düzəliş təklifiniz yoxlama gözləyir.',
  'Could not send this correction.': 'Düzəliş təklifini göndərmək mümkün olmadı.',
  'Staff review queue': 'Rəyçi növbəsi', 'Close staff review': 'Rəyçi bölməsini bağla',
  'Review catalogue suggestions': 'Kataloq təkliflərini yoxla',
  'Enter the server review key. It stays in this tab only.': 'Server yoxlama açarını daxil edin. Açar yalnız bu tabda qalır.',
  'Review key': 'Yoxlama açarı', 'Load suggestions': 'Təklifləri yüklə',
  'No pending suggestions are loaded.': 'Yoxlama üçün gözləyən təklif yüklənməyib.',
  'Open official source': 'Rəsmi mənbəni aç', 'Optional reviewer note': 'Rəyçi qeydi (istəyə bağlı)',
  'Accept and update catalogue': 'Qəbul et və kataloqu yenilə', 'Need more information': 'Əlavə məlumat istə', 'Reject': 'Rədd et',
  'Could not load the catalogue review queue.': 'Kataloq yoxlama növbəsini yükləmək mümkün olmadı.',
  'Could not update this catalogue suggestion.': 'Kataloq təklifini yeniləmək mümkün olmadı.',
  'Could not refresh the university catalogue.': 'Universitet kataloqunu yeniləmək mümkün olmadı.',
  'University': 'Universitet', 'City': 'Şəhər', 'StudyFields': 'İxtisas sahələri', 'Levels': 'Təhsil pillələri',
  'MinimumGpa': 'Minimum GPA', 'MonthlyGrant': 'Aylıq qrant',
  'UNIVERSITY GUIDE': 'UNİVERSİTET BƏLƏDÇİSİ', 'Choose a campus that fits your plans.': 'Planınıza uyğun kampus seçin.',
  'Compare study options, eligibility, deadlines, estimated costs and official sources in one place.': 'Təhsil seçimlərini, uyğunluğu, son tarixləri, xərcləri və rəsmi mənbələri bir yerdə müqayisə edin.',
  'campuses': 'kampus', 'countries': 'ölkə', 'average monthly grant': 'orta aylıq qrant',
  'Search university, city, or field…': 'Universitet, şəhər və ya ixtisas axtar…', 'Search universities': 'Universitet axtar',
  'Filter by country': 'Ölkəyə görə süz', 'universities': 'universitet', 'Source reviewed': 'Mənbə yoxlanılıb',
  'Find future students': 'Gələcək tələbələri tap', 'DEGREE LEVELS': 'TƏHSİL PİLLƏLƏRİ', 'MINIMUM GPA': 'MİNİMUM GPA',
  'APPLICATION DEADLINE': 'MÜRACİƏTİN SON TARİXİ', 'Hide university guide': 'Universitet bələdçisini gizlət',
  'University guide': 'Universitet bələdçisi', 'Official source': 'Rəsmi mənbə', 'Study and language': 'Təhsil və dil',
  'Budget planning': 'Büdcə planlaması', 'Student life': 'Tələbə həyatı', 'Prepare to apply': 'Müraciətə hazırlaşın',
  'Housing links': 'Yaşayış linkləri', 'No universities match this search': 'Axtarışa uyğun universitet tapılmadı',
  'Try another city, subject or country.': 'Başqa şəhər, ixtisas və ya ölkə sınayın.',
  'Use these figures to shortlist campuses; your home university confirms the exchange place and eligibility.': 'Bu məlumatlarla kampusları seçin; mübadilə yeri və uyğunluğu öz universitetiniz təsdiqləyir.',
  'Messages': 'Mesajlar', 'Private conversations between students': 'Tələbələr arasında şəxsi söhbətlər',
  'Your conversations will appear here.': 'Söhbətləriniz burada görünəcək.', 'Write a message…': 'Mesaj yazın…',
  'Write a message': 'Mesaj yazın', 'Send message': 'Mesaj göndər', 'Choose a student to start a conversation.': 'Söhbətə başlamaq üçün tələbə seçin.',
  'Dismiss error': 'Xətanı bağla', 'Language': 'Dil', 'Theme': 'Görünüş', 'Light mode': 'Açıq rejim', 'Dark mode': 'Tünd rejim',
  'MY ACCOUNT': 'HESABIM', 'Sort destinations': 'İstiqamətləri sırala', 'STUDENT COMMUNITY': 'TƏLƏBƏ İCMASI',
  'Meet the people going where you’re going.': 'Sizinlə eyni yerə gedən tələbələrlə tanış olun.',
  'Create and verify an account to find students planning the same destination and intake, then message them directly.': 'Eyni istiqaməti və dövrü planlaşdıran tələbələri tapıb onlara yazmaq üçün hesab yaradın və təsdiqləyin.',
  'Sign in or create an account': 'Daxil olun və ya hesab yaradın', 'Make the move together.': 'Bu səyahətə birlikdə başlayın.',
  'Find other students planning the same Erasmus destination and semester.': 'Eyni Erasmus istiqamətini və semestri planlaşdıran tələbələri tapın.',
  'Refresh conversations': 'Söhbətləri yenilə', 'Your profile is visible to matching students': 'Profiliniz uyğun tələbələrə görünür',
  'You’re browsing privately': 'Gizli rejimdə baxırsınız',
  'Only your name, university, study field, bio, and photo are shared.': 'Yalnız adınız, universitetiniz, ixtisasınız, təqdimatınız və şəkliniz paylaşılır.',
  'Opt in from My Account if you want matching students to find you.': 'Uyğun tələbələrin sizi tapması üçün Hesabım bölməsindən profil görünüşünü aktiv edin.',
  'Destination university': 'Gedəcəyiniz universitet', 'Intake': 'Mübadilə dövrü', 'Remove my plan': 'Planımdan sil', 'Add to my plan': 'Planıma əlavə et',
  'Going to {university}': '{university} istiqamətinə gedən tələbələr', 'your destination': 'sizin istiqamət', 'matching students': 'uyğun tələbələr', 'Message': 'Mesaj yaz',
  'Add this destination to your plan before messaging a student.': 'Tələbəyə mesaj yazmazdan əvvəl bu istiqaməti planınıza əlavə edin.',
  'Finding students…': 'Tələbələr axtarılır…', 'No students found yet': 'Hələ tələbə tapılmayıb',
  'Try another intake or share your own plan so others can find you.': 'Başqa mübadilə dövrünü seçin və ya digər tələbələrin sizi tapması üçün planınızı paylaşın.',
  'Home university not added': 'Öz universiteti əlavə edilməyib', 'Could not load the student community.': 'Tələbə icmasını yükləmək mümkün olmadı.',
  'Could not refresh conversations.': 'Söhbətləri yeniləmək mümkün olmadı.', 'Could not update your Erasmus plan.': 'Erasmus planınızı yeniləmək mümkün olmadı.',
  'Could not start this conversation.': 'Bu söhbəti başlatmaq mümkün olmadı.', 'Could not send this message.': 'Mesajı göndərmək mümkün olmadı.',
  'FIND MY MATCH': 'MƏNƏ UYĞUN OLANI TAP',
  'Could not find students for this destination.': 'Bu istiqamət üçün tələbə tapmaq mümkün olmadı.',
  'Could not load this conversation.': 'Bu söhbəti yükləmək mümkün olmadı.',
  'Short cycle': 'Qısa dövr', 'Bachelor': 'Bakalavr', 'Master': 'Magistr', 'Doctorate': 'Doktorantura',
  'Computer Science': 'Kompüter elmləri', 'Software Engineering': 'Proqram mühəndisliyi', 'Artificial Intelligence': 'Süni intellekt',
  'Data Science': 'Məlumat elmləri', 'Cybersecurity': 'Kibertəhlükəsizlik', 'Information Systems': 'İnformasiya sistemləri',
  'Engineering': 'Mühəndislik', 'Mechanical Engineering': 'Mexanika mühəndisliyi', 'Electrical Engineering': 'Elektrik mühəndisliyi',
  'Civil Engineering': 'İnşaat mühəndisliyi', 'Chemical Engineering': 'Kimya mühəndisliyi', 'Environmental Engineering': 'Ətraf mühit mühəndisliyi',
  'Architecture': 'Memarlıq', 'Urban Planning': 'Şəhərsalma', 'Business': 'Biznes', 'Finance': 'Maliyyə', 'Marketing': 'Marketinq',
  'Economics': 'İqtisadiyyat', 'Entrepreneurship': 'Sahibkarlıq', 'Management': 'Menecment', 'Design': 'Dizayn',
  'Product Design': 'Məhsul dizaynı', 'Graphic Design': 'Qrafik dizayn', 'Arts': 'İncəsənət', 'Media Studies': 'Media araşdırmaları',
  'Film': 'Kino', 'Music': 'Musiqi', 'Social Sciences': 'Sosial elmlər', 'Psychology': 'Psixologiya', 'Sociology': 'Sosiologiya',
  'Political Science': 'Siyasi elmlər', 'International Relations': 'Beynəlxalq münasibətlər', 'Law': 'Hüquq', 'Medicine': 'Tibb',
  'Nursing': 'Tibb bacılığı', 'Pharmacy': 'Əczaçılıq', 'Life Sciences': 'Həyat elmləri', 'Biology': 'Biologiya', 'Physics': 'Fizika', 'Mathematics': 'Riyaziyyat',
  'Autumn 2026/27': 'Payız 2026/27', 'Spring 2026/27': 'Yaz 2026/27', 'Autumn 2027/28': 'Payız 2027/28', 'Spring 2027/28': 'Yaz 2027/28',
  'Tech ecosystem': 'Texnologiya mühiti', 'Strong grant': 'Yüksək qrant', 'Safe city': 'Təhlükəsiz şəhər',
  'Warm climate': 'İsti iqlim', 'Outdoor activities': 'Açıq hava fəaliyyətləri', 'Creative scene': 'Yaradıcı mühit', 'Affordable living': 'Sərfəli yaşayış',
  'Urban culture': 'Şəhər mədəniyyəti', 'Quiet campus': 'Sakit kampus', 'Research focus': 'Tədqiqat yönümlü', 'International vibe': 'Beynəlxalq mühit',
  'Nightlife': 'Gecə həyatı', 'Beach access': 'Çimərliyə yaxınlıq', 'Mountains nearby': 'Yaxınlıqda dağlar', 'Startup scene': 'Startap mühiti',
  'Arts and culture': 'İncəsənət və mədəniyyət', 'Large campus': 'Böyük kampus', 'Small campus': 'Kiçik kampus', 'Public transport': 'İctimai nəqliyyat',
  'Bike friendly': 'Velosiped üçün əlverişli', 'English friendly': 'İngilisdilli mühit', 'Part-time work': 'Qismən iş imkanı', 'Green city': 'Yaşıl şəhər',
  'Historic city': 'Tarixi şəhər', 'Modern city': 'Müasir şəhər', 'Food culture': 'Yemək mədəniyyəti', 'Sports clubs': 'İdman klubları', 'Low competition': 'Az rəqabət',
  'Very cold winters': 'Çox soyuq qış', 'High living cost': 'Yüksək yaşayış xərci', 'Very isolated city': 'Ucqar şəhər', 'Low grant': 'Aşağı qrant',
  'Fast-paced city': 'Sürətli şəhər həyatı', 'Limited international community': 'Kiçik beynəlxalq icma', 'Heavy bureaucracy': 'Çox bürokratiya', 'Remote campus': 'Uzaq kampus',
  'Available degree levels:': 'Mövcud təhsil pillələri:', 'Languages listed:': 'Göstərilən dillər:', 'Estimated rent:': 'Təxmini kirayə:',
  'monthly living costs:': 'aylıq yaşayış xərcləri:', 'estimated combined cost:': 'təxmini ümumi xərc:', 'Grant coverage estimate:': 'Qrantın əhatə faizi:',
  'Confirm the current application route, exchange agreement and deadline with your home university.': 'Müraciət qaydasını, mübadilə razılaşmasını və son tarixi öz universitetinizlə dəqiqləşdirin.',
  'Source review date:': 'Mənbənin yoxlanma tarixi:', 'Estimates are for planning and may change.': 'Bunlar planlama üçün təxmini rəqəmlərdir və dəyişə bilər.',
  'EST. MONTHLY COST': 'TƏXMİNİ AYLIQ XƏRC', 'Available levels:': 'Mövcud pillələr:',
  'Check your home university agreement before applying.': 'Müraciət etməzdən əvvəl öz universitetinizlə razılaşmanı dəqiqləşdirin.',
  'Requirements vary by university; confirm the final list with your exchange coordinator.': 'Tələblər universitetə görə dəyişir; yekun siyahını mübadilə koordinatorunuzla dəqiqləşdirin.',
  'The city cost context is provided below:': 'Şəhər üzrə təxmini xərclər:', 'rent plus': 'kirayə və əlavə olaraq',
  'for food, transport, phone, and basics. This is a planning estimate, not a guaranteed quote.': 'qida, nəqliyyat, telefon və gündəlik ehtiyaclar üçün. Bu planlama təxminidir, zəmanətli qiymət deyil.',
  'grant against roughly': 'qrant, təxminən', 'monthly costs.': 'aylıq xərcə qarşı.',
  'It can cover core costs if you choose shared housing.': 'Ortaq yaşayış seçsəniz, əsas xərcləri qarşılaya bilər.',
  'Expect to add about': 'Təxminən bu qədər əlavə büdcə nəzərdə tutun:', 'or reduce costs with shared housing.': 'və ya ortaq yaşayışla xərcləri azaldın.',
  'of': 'addımdan',
  'Finland': 'Finlandiya', 'Germany': 'Almaniya', 'Netherlands': 'Niderland', 'Sweden': 'İsveç', 'Denmark': 'Danimarka',
  'Spain': 'İspaniya', 'Portugal': 'Portuqaliya', 'Italy': 'İtaliya', 'Austria': 'Avstriya', 'Belgium': 'Belçika', 'France': 'Fransa',
  'Ireland': 'İrlandiya', 'Poland': 'Polşa', 'Czechia': 'Çexiya', 'Estonia': 'Estoniya', 'Latvia': 'Latviya', 'Lithuania': 'Litva',
  'Slovakia': 'Slovakiya', 'Slovenia': 'Sloveniya', 'Croatia': 'Xorvatiya', 'Norway': 'Norveç', 'Switzerland': 'İsveçrə',
  'Greece': 'Yunanıstan', 'Romania': 'Rumıniya', 'Hungary': 'Macarıstan', 'United Kingdom': 'Böyük Britaniya', 'Iceland': 'İslandiya',
  'Luxembourg': 'Lüksemburq', 'Malta': 'Malta', 'Cyprus': 'Kipr', 'Serbia': 'Serbiya', 'Bosnia and Herzegovina': 'Bosniya və Herseqovina',
  'Andorra': 'Andorra', 'Bulgaria': 'Bolqarıstan', 'Turkey': 'Türkiyə', 'North Macedonia': 'Şimali Makedoniya',
  'Montenegro': 'Monteneqro', 'Georgia': 'Gürcüstan', 'Armenia': 'Ermənistan', 'Moldova': 'Moldova', 'Ukraine': 'Ukrayna', 'Albania': 'Albaniya',
  'English': 'İngilis dili', 'German': 'Alman dili', 'French': 'Fransız dili', 'Spanish': 'İspan dili', 'Italian': 'İtalyan dili',
  'Dutch': 'Niderland dili', 'Portuguese': 'Portuqal dili', 'Czech': 'Çex dili', 'Polish': 'Polyak dili', 'Swedish': 'İsveç dili',
  'Finnish': 'Fin dili', 'Danish': 'Danimarka dili', 'Norwegian': 'Norveç dili', 'Estonian': 'Eston dili', 'Latvian': 'Latış dili',
  'Lithuanian': 'Litva dili', 'Hungarian': 'Macar dili', 'Greek': 'Yunan dili', 'Romanian': 'Rumın dili', 'Croatian': 'Xorvat dili',
  'Slovenian': 'Sloven dili', 'Slovak': 'Slovak dili', 'Bulgarian': 'Bolqar dili', 'Turkish': 'Türk dili', 'Icelandic': 'İsland dili',
  'Serbian': 'Serb dili', 'Arabic': 'Ərəb dili', 'Chinese': 'Çin dili', 'Japanese': 'Yapon dili', 'Korean': 'Koreya dili',
  'Sign in to save your account settings.': 'Hesab ayarlarını yadda saxlamaq üçün daxil olun.',
  'Account settings saved successfully.': 'Hesab ayarları yadda saxlanıldı.', 'Could not save your settings.': 'Ayarları yadda saxlamaq mümkün olmadı.',
  'Could not complete the request.': 'Sorğunu tamamlamaq mümkün olmadı.', 'Could not request a password reset.': 'Şifrə yeniləmə sorğusu göndərilmədi.',
  'Could not reset your password.': 'Şifrəni yeniləmək mümkün olmadı.', 'Verification failed.': 'Təsdiqləmə alınmadı.',
  'Could not resend the verification code.': 'Təsdiq kodunu yenidən göndərmək mümkün olmadı.', 'Could not read this image.': 'Şəkli oxumaq mümkün olmadı.',
  'Choose an image file smaller than 4 MB.': '4 MB-dan kiçik şəkil faylı seçin.',
  'Choose a smaller image (maximum 8,000 pixels on each side).': 'Daha kiçik şəkil seçin (hər tərəfi maksimum 8 000 piksel).',
  'Could not prepare this image.': 'Bu şəkli hazırlamaq mümkün olmadı.', 'Choose a smaller or simpler image.': 'Daha kiçik və ya sadə şəkil seçin.',
  'Enter the reset code and a new password with at least 8 characters.': 'Yeniləmə kodunu və ən azı 8 simvollu yeni şifrəni daxil edin.',
  'Please provide your email and the verification token shown by the server.': 'E-poçtunuzu və serverin göstərdiyi təsdiq kodunu daxil edin.',
  'Enter your email address first.': 'Əvvəlcə e-poçt ünvanınızı daxil edin.',
  'The server returned the old profile after saving. Your changes were not confirmed; please try again.': 'Yadda saxladıqdan sonra server köhnə profili qaytardı. Dəyişikliklər təsdiqlənmədi, yenidən cəhd edin.',
  'Budget': 'Büdcə', 'Reminders': 'Xatırlatmalar', 'Student stories': 'Tələbə təcrübələri', 'Open messages': 'Mesajları aç',
  'Published checks look compatible': 'Dərc olunmuş tələblərə ilkin uyğunluq görünür', 'Review the listed requirements': 'Göstərilən tələbləri yenidən yoxlayın',
  'The bilateral agreement and nomination must still be confirmed by your home university.': 'İkitərəfli razılaşmanı və namizədliyi öz universitetiniz təsdiqləməlidir.',
  'Your study field is not listed for this destination.': 'İxtisasınız bu istiqamət üçün göstərilməyib.',
  'Your study field appears in the published list.': 'İxtisasınız dərc olunmuş siyahıda var.',
  'Your degree level is not listed for this destination.': 'Təhsil pilləniz bu istiqamət üçün göstərilməyib.',
  'Your degree level appears in the published list.': 'Təhsil pilləniz dərc olunmuş siyahıda var.',
  'Your GPA meets the listed minimum.': 'GPA göstəriciniz göstərilən minimuma uyğundur.',
  'The listed application deadline has passed or needs verification.': 'Göstərilən müraciət tarixi keçib və ya yenidən yoxlanmalıdır.',
  'Add your study field to check the listed subject requirements.': 'İxtisas tələblərini yoxlamaq üçün təhsil sahənizi əlavə edin.',
  'Add your degree level to check the listed level requirements.': 'Təhsil pilləsi tələblərini yoxlamaq üçün pillənizi əlavə edin.',
  'Add your GPA to compare it with the listed minimum.': 'Göstərilən minimumla müqayisə üçün GPA-nızı əlavə edin.',
  'No published requirement mismatch was found.': 'Dərc olunmuş tələblərlə ziddiyyət tapılmadı.',
  'Refresh the API to see eligibility checks': 'Uyğunluq yoxlamaları üçün API-ni yeniləyin.',
  'BUDGET PLANNER': 'BÜDCƏ PLANLAYICISI', 'Know what you may need each month.': 'Aylıq nə qədər büdcəyə ehtiyacınız olacağını bilin.',
  'Use your own estimates alongside the listed grant and city cost figures. All amounts are monthly EUR estimates.': 'Öz hesablamalarınızı göstərilən qrant və şəhər xərcləri ilə müqayisə edin. Məbləğlər aylıq avro təxminləridir.',
  'Rent / housing': 'Kirayə / yaşayış', 'Food, transport & basics': 'Qida, nəqliyyat və gündəlik xərclər',
  'Other monthly costs': 'Digər aylıq xərclər', 'My monthly funds': 'Mənim aylıq vəsaitim',
  'Your estimated monthly costs': 'Təxmini aylıq xərcləriniz', 'Listed monthly grant': 'Göstərilən aylıq qrant',
  'Estimated amount to cover after grant': 'Qrantdan sonra qarşılanmalı təxmini məbləğ', 'Your funds after estimated gap': 'Fərqdən sonra qalan vəsaitiniz',
  'Grant amounts, housing and living costs can change. Confirm the current grant and use local housing quotes before making financial decisions.': 'Qrant, kirayə və yaşayış xərcləri dəyişə bilər. Maliyyə qərarı verməzdən əvvəl aktual qrantı və yerli kirayə qiymətlərini yoxlayın.',
  'Destinations with the smallest estimated gap': 'Təxmini büdcə fərqi ən az olan istiqamətlər', 'Listed cost estimate minus listed grant': 'Göstərilən xərcdən göstərilən qrant çıxılır',
  'Covered in estimate': 'Təxminən tam qarşılanır', 'No destinations are available yet.': 'Hələ istiqamət mövcud deyil.',
  'DEADLINE REMINDERS': 'SON TARİX XATIRLATMALARI', 'Stay ahead of application dates.': 'Müraciət tarixlərini qaçırmayın.',
  'Choose a reminder from any destination card. We email you once before its listed deadline.': 'İstiqamət kartından xatırlatma qurun. Göstərilən son tarixdən əvvəl sizə bir dəfə e-poçt göndərəcəyik.',
  'Sign in and verify your email to save email reminders.': 'E-poçt xatırlatması qurmaq üçün daxil olun və e-poçtunuzu təsdiqləyin.',
  'You have no active reminders yet.': 'Hələ aktiv xatırlatmanız yoxdur.',
  'Open a destination card, expand its guide, then choose “Remind me”.': 'İstiqamət kartını açın, bələdçini genişləndirin və “Mənə xatırlat” seçin.',
  'Email me {days} days before': 'Son tarixdən {days} gün əvvəl e-poçt göndər', 'Email sent': 'E-poçt göndərilib',
  'Get one email before this listed deadline.': 'Göstərilən son tarixdən əvvəl bir e-poçt alın.', 'Application deadline reminder': 'Müraciət tarixi xatırlatması',
  'Remind me 7 days before': '7 gün əvvəl xatırlat', 'Remove reminder': 'Xatırlatmanı sil', 'Sign in for a reminder': 'Xatırlatma üçün daxil olun',
  'Deadlines may change. Confirm the current application date with the university and your home coordinator.': 'Son tarixlər dəyişə bilər. Aktual müraciət tarixini universitet və öz koordinatorunuzla dəqiqləşdirin.',
  'Could not update this reminder.': 'Xatırlatmanı yeniləmək mümkün olmadı.', 'Could not remove this reminder.': 'Xatırlatmanı silmək mümkün olmadı.',
  'This listed deadline has passed or needs verification, so it cannot be reminded.': 'Göstərilən son tarix keçib və ya yoxlanmalıdır; ona xatırlatma qurmaq mümkün deyil.',
  'STUDENT EXPERIENCES': 'TƏLƏBƏ TƏCRÜBƏLƏRİ', 'Learn from students planning the same move.': 'Eyni mübadiləni planlaşdıran tələbələrdən öyrənin.',
  'Share practical details about applying, studying, housing, and everyday life.': 'Müraciət, təhsil, yaşayış və gündəlik həyat barədə faydalı məlumat paylaşın.',
  'Stories are community contributions. “Alumni” is self-reported and not independently verified by Erasmus With Us.': 'Təcrübələr icma üzvləri tərəfindən paylaşılır. “Məzun” statusu öz bəyanatıdır və Erasmus With Us tərəfindən ayrıca yoxlanılmır.',
  'student stories': 'tələbə təcrübəsi', 'No stories yet': 'Hələ təcrübə paylaşılmayıb',
  'Loading student stories…': 'Tələbə təcrübələri yüklənir…',
  'Be the first student to share a useful experience for this destination.': 'Bu istiqamət üçün faydalı təcrübə paylaşan ilk tələbə olun.',
  'ADD YOUR EXPERIENCE': 'TƏCRÜBƏNİZİ PAYLAŞIN', 'Help the next student prepare.': 'Növbəti tələbəyə hazırlaşmağa kömək edin.',
  'Sign in and verify your email to post or update one story for this destination.': 'Bu istiqamət üçün təcrübə paylaşmaq və ya yeniləmək üçün daxil olun və e-poçtunuzu təsdiqləyin.',
  'Sign in to share': 'Paylaşmaq üçün daxil olun', 'Your experience': 'Təcrübəniz', 'Planning': 'Planlaşdırıram', 'Alumni': 'Məzun',
  'Exchange intake': 'Mübadilə dövrü', 'Rating': 'Qiymət', 'Your story': 'Təcrübəniz', 'What should another student know?': 'Digər tələbə nəyi bilməlidir?',
  'At least 20 characters': 'Ən azı 20 simvol', 'Publish experience': 'Təcrübəni paylaş',
  'Keep personal contact details and sensitive information out of public stories.': 'Şəxsi əlaqə məlumatlarını və həssas məlumatları açıq təcrübələrdə paylaşmayın.',
  'Could not load student experiences.': 'Tələbə təcrübələrini yükləmək mümkün olmadı.', 'Could not save this experience.': 'Təcrübəni yadda saxlamaq mümkün olmadı.',
  'Enable message alerts': 'Mesaj bildirişlərini aktiv et', 'Report student': 'Tələbə barədə şikayət et', 'Block student': 'Tələbəni blokla',
  'You have a new message from another student.': 'Başqa tələbədən yeni mesajınız var.',
  'Unblock student': 'Bloku götür', 'Tell us why you are reporting this student': 'Bu tələbə barədə şikayət səbəbini yazın',
  'Submit report': 'Şikayəti göndər', 'You blocked this student. Messages are disabled.': 'Bu tələbəni bloklamısınız. Mesajlaşma söndürülüb.',
  'This student has blocked this conversation. Messages are disabled.': 'Bu tələbə söhbəti bloklayıb. Mesajlaşma söndürülüb.',
  'Messaging is disabled': 'Mesajlaşma söndürülüb', 'Student unblocked. They may be able to find and message you again.': 'Tələbənin bloku götürüldü. O, sizi yenidən tapa və yaza bilər.',
  'Student blocked. They will not appear in your matching student list.': 'Tələbə bloklandı və uyğun tələbələr siyahınızda görünməyəcək.',
  'Report submitted for review.': 'Şikayət yoxlama üçün göndərildi.', 'Could not update this block.': 'Bloku yeniləmək mümkün olmadı.',
  'Could not submit this report.': 'Şikayəti göndərmək mümkün olmadı.', 'Dismiss notice': 'Bildirişi bağla',
}

function translateText(language: Language, text: string) {
  if (language !== 'en') return text
  if (language === 'en') return text
  const direct = translations[text]
  if (direct) return direct

  const welcome = text.match(/^Welcome, (.+)\. Your account is ready\.$/)
  if (welcome) return `Xoş gəlmisiniz, ${welcome[1]}. Hesabınız hazırdır.`

  const verificationPrefix = 'We sent a six-letter verification code to '
  if (text.startsWith(verificationPrefix)) {
    const details = text.slice(verificationPrefix.length)
    const developmentSeparator = '. Development code: '
    const separatorIndex = details.indexOf(developmentSeparator)
    const email = (separatorIndex < 0 ? details : details.slice(0, separatorIndex)).replace(/\.$/, '')
    const code = separatorIndex < 0 ? '' : details.slice(separatorIndex + developmentSeparator.length)
    return `Altı simvollu təsdiq kodunu ${email} ünvanına göndərdik.${code ? ` Sınaq kodu: ${code}` : ''}`
  }

  const gpaMismatch = text.match(/^Your GPA is below the listed minimum of ([\d.]+)\.$/)
  if (gpaMismatch) return `GPA göstəriciniz göstərilən ${gpaMismatch[1]} minimumundan aşağıdır.`

  return text
}

type Preferences = {
  language: Language
  setLanguage: (language: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  t: (text: string) => string
}

const PreferencesContext = createContext<Preferences | null>(null)

function readChoice<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return allowed.includes(value as T) ? value as T : fallback
  } catch {
    return fallback
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => readChoice('erasmuswithus.language', interfaceLanguages.map(({ code }) => code), 'en'))
  const [theme, setTheme] = useState<Theme>(() => readChoice('erasmuswithus.theme', ['light', 'dark'], 'light'))
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    try {
      localStorage.setItem('erasmuswithus.language', language)
      localStorage.setItem('erasmuswithus.theme', theme)
    } catch {
      // Preferences still apply for this session when browser storage is unavailable.
    }
  }, [language, theme])
  const value = useMemo<Preferences>(() => ({
    language,
    setLanguage,
    theme,
    setTheme,
    t: (text) => translateText(language, text),
  }), [language, theme])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const value = useContext(PreferencesContext)
  if (!value) throw new Error('usePreferences must be used inside PreferencesProvider')
  return value
}
