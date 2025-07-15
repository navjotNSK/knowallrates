"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface Settings {
  language: string
  darkMode: boolean
  notifications: boolean
  currency: string
  timezone: string
}

interface SettingsContextType {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  formatCurrency: (amount: number) => string
  formatDate: (date: string | Date) => string
  t: (key: string) => string
}

const defaultSettings: Settings = {
  language: "en",
  darkMode: false,
  notifications: true,
  currency: "INR",
  timezone: "Asia/Kolkata",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.admin": "Admin Panel",
    "nav.payment": "Pay Us",
    "nav.signout": "Log out",
    "nav.signin": "Sign In",
    "nav.signup": "Sign Up",

    // Dashboard
    "dashboard.welcome": "Welcome back",
    "dashboard.track": "Track live rates and market predictions",
    "dashboard.live_data": "Live data from external APIs",
    "dashboard.connection_issue": "Connection Issue",
    "dashboard.using_fallback": "Using fallback data. Error:",

    // Asset names
    "asset.gold_22k": "22K Gold Today",
    "asset.gold_24k": "24K Gold Today",
    "asset.silver": "Silver Today",
    "asset.bitcoin": "Bitcoin Today",
    "asset.gold_22k_yesterday": "22K Gold Yesterday",
    "asset.gold_24k_yesterday": "24K Gold Yesterday",

    // Charts
    "chart.historical": "Asset Rates - Last 10 Days",
    "chart.historical_desc": "Historical price trends for Gold, Silver, and Bitcoin",
    "chart.comparison": "Rate Comparison - Last 5 Days",
    "chart.comparison_desc": "Daily comparison between different assets",

    // Prediction
    "prediction.title": "Tomorrow's Prediction",
    "prediction.confidence": "Confidence",
    "prediction.trend": "Trend",
    "prediction.bullish": "Bullish",
    "prediction.bearish": "Bearish",
    "prediction.stable": "Stable",

    // Settings
    "settings.title": "Settings",
    "settings.desc": "Customize your experience",
    "settings.language": "Language",
    "settings.language_desc": "Choose your preferred language for the interface",
    "settings.dark_mode": "Dark Mode",
    "settings.dark_mode_desc": "Toggle between light and dark themes",
    "settings.currency": "Preferred Currency",
    "settings.notifications": "Push Notifications",
    "settings.notifications_desc": "Receive alerts for significant rate changes",
    "settings.timezone": "Timezone",
    "settings.save": "Save Settings",
    "settings.saving": "Saving...",
    "settings.saved": "Settings saved successfully!",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.back": "Back to Dashboard",
    "common.save": "Save",
    "common.cancel": "Cancel",
  },
  hi: {
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.profile": "प्रोफाइल",
    "nav.settings": "सेटिंग्स",
    "nav.admin": "एडमिन पैनल",
    "nav.payment": "भुगतान करें",
    "nav.signout": "लॉग आउट",
    "nav.signin": "साइन इन",
    "nav.signup": "साइन अप",

    // Dashboard
    "dashboard.welcome": "वापस आपका स्वागत है",
    "dashboard.track": "लाइव दरें और बाजार की भविष्यवाणियों को ट्रैक करें",
    "dashboard.live_data": "बाहरी APIs से लाइव डेटा",
    "dashboard.connection_issue": "कनेक्शन समस्या",
    "dashboard.using_fallback": "फॉलबैक डेटा का उपयोग। त्रुटि:",

    // Asset names
    "asset.gold_22k": "22K सोना आज",
    "asset.gold_24k": "24K सोना आज",
    "asset.silver": "चांदी आज",
    "asset.bitcoin": "बिटकॉइन आज",
    "asset.gold_22k_yesterday": "22K सोना कल",
    "asset.gold_24k_yesterday": "24K सोना कल",

    // Charts
    "chart.historical": "संपत्ति दरें - पिछले 10 दिन",
    "chart.historical_desc": "सोना, चांदी और बिटकॉइन के लिए ऐतिहासिक मूल्य रुझान",
    "chart.comparison": "दर तुलना - पिछले 5 दिन",
    "chart.comparison_desc": "विभिन्न संपत्तियों के बीच दैनिक तुलना",

    // Prediction
    "prediction.title": "कल की भविष्यवाणी",
    "prediction.confidence": "विश्वास",
    "prediction.trend": "रुझान",
    "prediction.bullish": "तेजी",
    "prediction.bearish": "मंदी",
    "prediction.stable": "स्थिर",

    // Settings
    "settings.title": "सेटिंग्स",
    "settings.desc": "अपने अनुभव को अनुकूलित करें",
    "settings.language": "भाषा",
    "settings.language_desc": "इंटरफेस के लिए अपनी पसंदीदा भाषा चुनें",
    "settings.dark_mode": "डार्क मोड",
    "settings.dark_mode_desc": "लाइट और डार्क थीम के बीच टॉगल करें",
    "settings.currency": "पसंदीदा मुद्रा",
    "settings.notifications": "पुश नोटिफिकेशन",
    "settings.notifications_desc": "महत्वपूर्ण दर परिवर्तनों के लिए अलर्ट प्राप्त करें",
    "settings.timezone": "समय क्षेत्र",
    "settings.save": "सेटिंग्स सेव करें",
    "settings.saving": "सेव कर रहे हैं...",
    "settings.saved": "सेटिंग्स सफलतापूर्वक सेव हो गईं!",

    // Common
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
    "common.back": "डैशबोर्ड पर वापस",
    "common.save": "सेव करें",
    "common.cancel": "रद्द करें",
  },
  gu: {
    // Navigation
    "nav.dashboard": "ડેશબોર્ડ",
    "nav.profile": "પ્રોફાઇલ",
    "nav.settings": "સેટિંગ્સ",
    "nav.admin": "એડમિન પેનલ",
    "nav.payment": "ચુકવણી કરો",
    "nav.signout": "લૉગ આઉટ",
    "nav.signin": "સાઇન ઇન",
    "nav.signup": "સાઇન અપ",

    // Dashboard
    "dashboard.welcome": "પાછા આવવા બદલ આભાર",
    "dashboard.track": "લાઇવ દરો અને બજાર આગાહીઓ ટ્રેક કરો",
    "dashboard.live_data": "બાહ્ય APIs થી લાઇવ ડેટા",
    "dashboard.connection_issue": "કનેક્શન સમસ્યા",
    "dashboard.using_fallback": "ફૉલબેક ડેટાનો ઉપયોગ. ભૂલ:",

    // Asset names
    "asset.gold_22k": "22K સોનું આજે",
    "asset.gold_24k": "24K સોનું આજે",
    "asset.silver": "ચાંદી આજે",
    "asset.bitcoin": "બિટકોઇન આજે",
    "asset.gold_22k_yesterday": "22K સોનું ગઈકાલે",
    "asset.gold_24k_yesterday": "24K સોનું ગઈકાલે",

    // Settings
    "settings.title": "સેટિંગ્સ",
    "settings.desc": "તમારા અનુભવને કસ્ટમાઇઝ કરો",
    "settings.language": "ભાષા",
    "settings.language_desc": "ઇન્ટરફેસ માટે તમારી પસંદીદા ભાષા પસંદ કરો",
    "settings.dark_mode": "ડાર્ક મોડ",
    "settings.dark_mode_desc": "લાઇટ અને ડાર્ક થીમ વચ્ચે ટૉગલ કરો",
    "settings.currency": "પસંદગીની ચલણ",
    "settings.save": "સેટિંગ્સ સેવ કરો",
    "settings.saving": "સેવ કરી રહ્યા છીએ...",
    "settings.saved": "સેટિંગ્સ સફળતાપૂર્વક સેવ થઈ!",

    // Common
    "common.loading": "લોડ થઈ રહ્યું છે...",
    "common.back": "ડેશબોર્ડ પર પાછા",
    "common.save": "સેવ કરો",
  },
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("knowallrates-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    }
  }, [])

  // Apply dark mode immediately when settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("knowallrates-settings", JSON.stringify(settings))
  }, [settings])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const formatCurrency = (amount: number): string => {
    const currencyConfig = {
      INR: { locale: "en-IN", currency: "INR" },
      USD: { locale: "en-US", currency: "USD" },
      EUR: { locale: "de-DE", currency: "EUR" },
      GBP: { locale: "en-GB", currency: "GBP" },
    }

    const config = currencyConfig[settings.currency as keyof typeof currencyConfig] || currencyConfig.INR

    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: settings.currency === "INR" ? 0 : 2,
      maximumFractionDigits: settings.currency === "INR" ? 0 : 2,
    }).format(amount)
  }

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date

    const localeMap = {
      en: "en-US",
      hi: "hi-IN",
      gu: "gu-IN",
      mr: "mr-IN",
      ta: "ta-IN",
      te: "te-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      bn: "bn-IN",
      pa: "pa-IN",
    }

    const locale = localeMap[settings.language as keyof typeof localeMap] || "en-US"

    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: settings.timezone,
    }).format(dateObj)
  }

  const t = (key: string): string => {
    const languageTranslations = translations[settings.language] || translations.en
    return languageTranslations[key] || key
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        formatCurrency,
        formatDate,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
