import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from 'lucide-react'

interface AuthProps {
  currentScreen: number;
  setCurrentScreen: (screen: number) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  authMessage: string;
  isDarkMode: boolean;
}

const Auth: React.FC<AuthProps> = ({
  currentScreen,
  setCurrentScreen,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  handleRegister,
  authMessage,
  isDarkMode
}) => {
  const screens = [
    // Welcome Screen
    <div key="welcome" className={`flex flex-col items-center justify-between h-full p-6 text-center ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-black'}`}>
      <div className="text-sm">2023</div>
      <div>
        <img src="/placeholder2.png?height=200&width=200" alt="AI Robot" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">Boost your productivity</h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'} mb-6`}>Chat with the smartest AI - Experience the power of AI with us.</p>
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        </div>
      </div>
      <div className="w-full space-y-4">
        <Button className="w-full" onClick={() => setCurrentScreen(1)}>Login</Button>
        <Button variant="outline" className="w-full" onClick={() => setCurrentScreen(2)}>Create an account</Button>
      </div>
    </div>,

    // Login Screen
    <div key="login" className={`p-6 space-y-6 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-black'}`}>
      <Button variant="ghost" className="p-0" onClick={() => setCurrentScreen(0)}>Back</Button>
      <div>
        <h2 className="text-2xl font-bold mb-2">Login</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}>Fill in the blanks below to sign into your account.</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="ex: johndoe@gmail.com" onChange={(e) => setEmail(e.target.value)} className={isDarkMode ? 'bg-gray-800 text-gray-200' : ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="ex: ••••••••" onChange={(e) => setPassword(e.target.value)} className={isDarkMode ? 'bg-gray-800 text-gray-200' : ''} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label htmlFor="remember" className="text-sm">Remember Me</label>
          </div>
          <Button variant="link" className="p-0">Forgot Password?</Button>
        </div>
        <Button type="submit" className="w-full">Login</Button>
      </form>
      {authMessage && <p className="text-center text-sm">{authMessage}</p>}
      <div className="text-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'} mb-4`}>or continue with</p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" size="icon"><User className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><User className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><User className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="text-center">
        <Button variant="link" onClick={() => setCurrentScreen(2)}>Don't have an account? Sign up</Button>
      </div>
    </div>,

    // Sign Up Screen
    <div key="signup" className={`p-6 space-y-6 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-black'}`}>
      <Button variant="ghost" className="p-0" onClick={() => setCurrentScreen(0)}>Back</Button>
      <div>
        <h2 className="text-2xl font-bold mb-2">Sign up</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}>Fill in the blanks below to create an account.</p>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="ex: John Doe" onChange={(e) => setName(e.target.value)} className={isDarkMode ? 'bg-gray-800 text-gray-200' : ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="ex: johndoe@gmail.com" onChange={(e) => setEmail(e.target.value)} className={isDarkMode ? 'bg-gray-800 text-gray-200' : ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="ex: ••••••••" onChange={(e) => setPassword(e.target.value)} className={isDarkMode ? 'bg-gray-800 text-gray-200' : ''} />
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}`}>
          By signing up you agree to our <Button variant="link" className="p-0">terms &amp; conditions</Button> and <Button variant="link" className="p-0">privacy policy</Button>.
        </p>
        <Button type="submit" className="w-full">Continue</Button>
      </form>
      {authMessage && <p className="text-center text-sm">{authMessage}</p>}
      <div className="text-center">
        <Button variant="link" onClick={() => setCurrentScreen(1)}>Already signed up? Login</Button>
      </div>
    </div>,

    // Verification Screen
    <div key="verify" className={`p-6 space-y-6 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-black'}`}>
      <Button variant="ghost" className="p-0" onClick={() => setCurrentScreen(2)}>Back</Button>
      <div>
        <h2 className="text-2xl font-bold mb-2">Check your mail</h2>
        <p className={isDarkMode ? 'text-gray-400' : 'text-muted-foreground'}>We've sent a confirmation link to {email}. Please check your email and click on the link to verify your account.</p>
      </div>
      <div className="text-center">
        <Button variant="link" onClick={() => setCurrentScreen(1)}>Return to Login</Button>
      </div>
    </div>
  ];

  return screens[currentScreen];
};

export default Auth;
