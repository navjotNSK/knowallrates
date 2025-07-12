"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { authService } from "@/lib/auth"
import { useSettings } from "@/lib/settings-context"
import { Settings, ArrowLeft, Save, Moon, Sun, Globe, Bell, Clock, DollarSign } from "lucide-react"

export default function SettingsPage() {
  const { settings, updateSetting, t, formatCurrency } = useSettings()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/auth/signin")
      return
    }
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setSuccess("")

    try {
      // Save to backend (optional - for user preferences sync across devices)
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSuccess(t("settings.saved"))
      }
    } catch (err) {
      console.error("Failed to sync settings to backend:", err)
      // Still show success since local settings are saved
      setSuccess(t("settings.saved"))
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    updateSetting(key, value)
  }

  // Demo values to show currency formatting in real-time
  const demoGoldPrice = 5850
  const demoBitcoinPrice = 3735000

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Settings className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-2xl dark:text-white">{t("settings.title")}</CardTitle>
                <CardDescription className="dark:text-gray-300">{t("settings.desc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-green-600 dark:text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Language Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Label htmlFor="language" className="text-base font-medium dark:text-white">
                  {t("settings.language")}
                </Label>
              </div>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                  <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                  <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
                  <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                  <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.language_desc")}</p>
            </div>

            {/* Dark Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.darkMode ? (
                    <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <Label htmlFor="darkMode" className="text-base font-medium dark:text-white">
                    {t("settings.dark_mode")}
                  </Label>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.dark_mode_desc")}</p>
            </div>

            {/* Currency with Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Label htmlFor="currency" className="text-base font-medium dark:text-white">
                  {t("settings.currency")}
                </Label>
              </div>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
              {/* Live Preview */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Live Preview:</p>
                <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <div>22K Gold: {formatCurrency(demoGoldPrice)}</div>
                  <div>Bitcoin: {formatCurrency(demoBitcoinPrice)}</div>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Label htmlFor="timezone" className="text-base font-medium dark:text-white">
                  {t("settings.timezone")}
                </Label>
              </div>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                </SelectContent>
              </Select>
              {/* Live Preview */}
              <div className="p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Current Time:</p>
                <div className="text-sm text-green-700 dark:text-green-400">
                  {new Intl.DateTimeFormat("en-US", {
                    timeZone: settings.timezone,
                    dateStyle: "full",
                    timeStyle: "medium",
                  }).format(new Date())}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <Label htmlFor="notifications" className="text-base font-medium dark:text-white">
                      {t("settings.notifications")}
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.notifications_desc")}</p>
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                />
              </div>
            </div>

            {/* Settings Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Current Settings Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Language:</span>
                  <span className="ml-2 font-medium dark:text-white">
                    {settings.language === "en"
                      ? "English"
                      : settings.language === "hi"
                        ? "हिंदी"
                        : settings.language === "gu"
                          ? "ગુજરાતી"
                          : settings.language.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                  <span className="ml-2 font-medium dark:text-white">{settings.darkMode ? "Dark" : "Light"}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                  <span className="ml-2 font-medium dark:text-white">{settings.currency}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Notifications:</span>
                  <span className="ml-2 font-medium dark:text-white">
                    {settings.notifications ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t("settings.saving")}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{t("settings.save")}</span>
                </div>
              )}
            </Button>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Settings are automatically saved locally and applied immediately. Changes sync across your devices when
              signed in.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
