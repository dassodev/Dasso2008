import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  User,
  ArrowLeft,
  CreditCard,
  Settings,
  MessageSquare,
  Info,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Target,
  Users,
  BookOpen
} from 'lucide-react'
import { UserProfile } from '../types/book'

interface ProfileMenuProps {
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (isOpen: boolean) => void;
  currentProfileScreen: string | null;
  setCurrentProfileScreen: (screen: string | null) => void;
  userProfile: UserProfile | null;
  handleLogout: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  textAlign: string;
  setTextAlign: (align: string) => void;
  showReadingProgress: boolean;
  setShowReadingProgress: (show: boolean) => void;
  bookshelfBackground: string;
  setBookshelfBackground: (background: string) => void;
  showSpaces: boolean;
  setShowSpaces: (show: boolean) => void;
  isPaginationEnabled?: boolean;
  setIsPaginationEnabled?: (enabled: boolean) => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  currentProfileScreen,
  setCurrentProfileScreen,
  userProfile,
  handleLogout,
  updateProfile,
  isDarkMode,
  toggleDarkMode,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  showReadingProgress,
  setShowReadingProgress,
  bookshelfBackground,
  setBookshelfBackground,
  showSpaces,
  setShowSpaces,
  isPaginationEnabled = false,
  setIsPaginationEnabled = () => {}
}) => {
  const [updatedName, setUpdatedName] = React.useState(userProfile?.name || '')
  const [updatedEmail, setUpdatedEmail] = React.useState(userProfile?.email || '')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile({ name: updatedName, email: updatedEmail })
  }

  const renderMainMenu = () => (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} z-50 overflow-y-auto`}>
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => setIsProfileMenuOpen(false)}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded-full`}
          >
            <ArrowLeft className={`h-6 w-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`} />
          </Button>
          <h1 className={`text-2xl font-bold ml-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Back</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
            <User className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{userProfile?.name || 'Name'}</h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userProfile?.email || 'dasso.cn@gmail.com'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'User Account', screen: 'UserAccount', icon: User },
            { label: 'Subscription', screen: 'Subscription', icon: CreditCard },
            { label: 'Settings', screen: 'Settings', icon: Settings },
            { label: 'Contact Us', screen: 'ContactUs', icon: MessageSquare },
            { label: 'About Us', screen: 'AboutUs', icon: Info },
          ].map((item, index, array) => (
            <div key={item.screen}>
              <Button
                variant="ghost"
                className={`w-full justify-between text-lg py-3 px-0 ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentProfileScreen(item.screen)}
              >
                <span className="flex items-center">
                  <item.icon className={`h-5 w-5 mr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  {item.label}
                </span>
                <ChevronRight className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </Button>
              {index < array.length - 1 && <div className={`h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-full mt-1`} />}
            </div>
          ))}

          <div className={`h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} w-full`} />
          <Button
            variant="ghost"
            className={`w-full justify-between text-lg py-3 px-0 ${
              isDarkMode
                ? 'text-red-400 hover:bg-gray-800'
                : 'text-red-500 hover:bg-gray-50'
            }`}
            onClick={handleLogout}
          >
            <span className="flex items-center">
              <LogOut className="h-5 w-5 mr-3 text-current" />
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  )

  const renderUserAccount = () => (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} z-50 overflow-y-auto`}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => setCurrentProfileScreen(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-primary'} mb-6`}>User Account</h1>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleUpdateProfile}>
                <div>
                  <Label htmlFor="name" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Name</Label>
                  <Input
                    id="name"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className={`mt-1 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'}`}
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="email" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Email</Label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-primary/60'}`} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={updatedEmail}
                      onChange={(e) => setUpdatedEmail(e.target.value)}
                      className={`pl-10 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'}`}
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-4 w-full">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderSubscription = () => (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} z-50 overflow-y-auto`}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => setCurrentProfileScreen(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-primary'} mb-6`}>Subscription</h1>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <CreditCard className="mr-2 h-5 w-5" /> Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Free Plan</span>
                <Badge variant={isDarkMode ? 'outline' : 'default'}>Active</Badge>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>Enjoy basic features with our free plan.</p>
              <Button className="w-full">Upgrade to Premium</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} z-50 overflow-y-auto`}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => setCurrentProfileScreen(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-primary'} mb-6`}>Settings</h1>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Settings className="mr-2 h-5 w-5" /> General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Dark Mode</span>
                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Notifications</span>
                <Switch id="notifications" />
              </div>
              <div>
                <Label htmlFor="language" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Language</Label>
                <Select>
                  <SelectTrigger id="language" className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'}>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> Book Shelf Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Show Reading Progress</span>
                <Switch
                  id="reading-progress"
                  checked={showReadingProgress}
                  onCheckedChange={setShowReadingProgress}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Enable Pagination</span>
                <Switch
                  id="pagination"
                  checked={isPaginationEnabled}
                  onCheckedChange={setIsPaginationEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookshelf-background" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>
                  Bookshelf Background
                </Label>
                <Select value={bookshelfBackground} onValueChange={setBookshelfBackground}>
                  <SelectTrigger id="bookshelf-background" className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'}>
                    <SelectValue placeholder="Select a background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bookshelf-background.webp">Default Wooden</SelectItem>
                    <SelectItem value="bookshelf-white.webp">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <BookOpen className="mr-2 h-5 w-5" /> Asian Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>
                  Show spaces between words
                </span>
                <Switch
                  id="show-spaces"
                  checked={showSpaces}
                  onCheckedChange={setShowSpaces}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderContactUs = () => (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} z-50 overflow-y-auto`}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => setCurrentProfileScreen(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-primary'} mb-6`}>Contact Us</h1>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" /> Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>
                We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us.
              </p>
              <div>
                <Label htmlFor="name" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Name</Label>
                <Input id="name" placeholder="Your name" className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'} />
              </div>
              <div>
                <Label htmlFor="email" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Email</Label>
                <Input id="email" type="email" placeholder="Your email" className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'} />
              </div>
              <div>
                <Label htmlFor="message" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Message</Label>
                <Textarea id="message" placeholder="Your message" className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'} />
              </div>
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Phone className="mr-2 h-5 w-5" /> Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>support@dassoshu.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>+1 (123) 456-7890</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>123 Book Street, Reading City, 12345</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderAboutUs = () => (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} z-50 overflow-y-auto`}>
      <div className="p-6">
        <Button variant="ghost" onClick={() => setCurrentProfileScreen(null)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-primary'} mb-6`}>About Us</h1>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Info className="mr-2 h-5 w-5" /> Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>
                DassoShu was founded in 2023 with a mission to revolutionize the way people read and interact with digital books. Our team of passionate readers and tech enthusiasts came together to create a platform that combines the joy of reading with the convenience of modern technology.
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>
                We believe that everyone should have access to a vast library of books at their fingertips, with tools that enhance the reading experience and make it more enjoyable than ever before.
              </p>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Target className="mr-2 h-5 w-5" /> Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>
                At DassoShu, our mission is to:
              </p>
              <ul className={`list-disc list-inside text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>
                <li>Make reading accessible to everyone, anywhere, anytime</li>
                <li>Provide a user-friendly platform that enhances the digital reading experience</li>
                <li>Foster a community of book lovers and promote the joy of reading</li>
                <li>Continuously innovate and improve our services based on user feedback</li>
              </ul>
            </CardContent>
          </Card>
          <Card className={isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-primary'}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Users className="mr-2 h-5 w-5" /> Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-primary/60'}`}>
                DassoShu is brought to you by a diverse team of developers, designers, and book enthusiasts. We're committed to creating the best possible experience for our users and are always working on new features and improvements.
              </p>
              <Button className="w-full">Join Our Team</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  if (currentProfileScreen === 'UserAccount') return renderUserAccount()
  if (currentProfileScreen === 'Subscription') return renderSubscription()
  if (currentProfileScreen === 'Settings') return renderSettings()
  if (currentProfileScreen === 'ContactUs') return renderContactUs()
  if (currentProfileScreen === 'AboutUs') return renderAboutUs()

  return renderMainMenu()
}

export default ProfileMenu
