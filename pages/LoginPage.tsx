
import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useDataStore } from '../store/dataStore';
import { auth, db, getPath } from '../lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { 
  getFirestore,
  doc, 
  getDocs, 
  collection, 
  query, 
  where, 
  setDoc, 
  updateDoc,
  limit 
} from 'firebase/firestore';
import { 
  Key, 
  Mail, 
  Lock, 
  User as UserIcon, 
  X,
  ArrowRight,
  Loader2,
  Cpu,
  Target,
  Plus,
  Fingerprint,
  Camera,
  Phone,
  MapPin,
  Binary,
  RefreshCw,
  ShieldCheck,
  Database,
  Eye,
  EyeOff,
  Terminal,
  ShieldAlert,
  ChevronLeft
} from 'lucide-react';
import { UserRole, UserStatus } from '../types';
import { compressImage } from '../lib/utils';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';

const firebaseConfig = {
  apiKey: "AIzaSyD2GZkyQBir2wQIBilCXogyT3gz8QRVKgI",
  authDomain: "edu-lexonex.firebaseapp.com",
  projectId: "edu-lexonex",
  storageBucket: "edu-lexonex.firebasestorage.app",
  messagingSenderId: "47491392874",
  appId: "1:47491392874:web:b2d040ba976f17bebe7113"
};

const LoginPage: React.FC = () => {
  const [view, setView] = useState<'LOGIN' | 'VERIFY_TOKEN' | 'REG_FORM' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [verifiedAdminId, setVerifiedAdminId] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const { addNotification, setGlobalLoading, isGlobalLoading } = useUIStore();
  const { 
    brandingName, 
    isInitialized, 
    initializePublicSettings, 
    registrationKeyRequired, 
    defaultAdminId,
    registrationToken: masterKey
  } = useDataStore();
  const [searchParams] = useSearchParams();
  const [regData, setRegData] = useState({ displayName: '', email: '', username: '', password: '', phone: '', address: '', photoURL: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [view]);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        try {
          const compressed = await compressImage(croppedImage);
          setRegData({ ...regData, photoURL: compressed });
        } catch (err) {
          console.error("Compression failed:", err);
          setRegData({ ...regData, photoURL: croppedImage });
        }
      }
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      addNotification('ERROR', 'FAILED', 'Failed to crop image.');
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setRegistrationToken(token);
      setView('VERIFY_TOKEN');
    } else if (!registrationKeyRequired) {
      // If no token and registrationKeyRequired is false, we can potentially skip to registration
      // But let's keep it simple for now and just allow skipping token verification if they click "Create New Identity"
    }
  }, [searchParams, registrationKeyRequired]);

  useEffect(() => {
    initializePublicSettings();
  }, [initializePublicSettings]);

  useEffect(() => {
    // Only hide the initial loader once when the component mounts and data is ready
    if (isInitialized) {
      const timer = setTimeout(() => {
        setGlobalLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  useEffect(() => {
    if (!isGlobalLoading) {
      setIsAuthenticating(false);
    }
  }, [isGlobalLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setGlobalLoading(true);
    
    // Small delay to ensure loader is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Note: Success notification is now handled in authStore after status verification
      // Note: We don't setGlobalLoading(false) here because we want it to persist until the dashboard loads
    } catch (e: any) {
      console.error("Login Error:", e);
      let errorMsg = 'Invalid credentials.';
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please try again.';
      } else if (e.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.';
      }
      addNotification('ERROR', 'REJECTED', errorMsg);
      setIsAuthenticating(false);
      setGlobalLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return addNotification('ERROR', 'EMPTY', 'Enter email.');
    setIsAuthenticating(true);
    setGlobalLoading(true);
    
    // Small delay to ensure loader is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      await sendPasswordResetEmail(auth, email);
      addNotification('SUCCESS', 'SENT', 'Recovery dispatched.');
      setView('LOGIN');
    } catch (e: any) {
      addNotification('ERROR', 'FAILED', 'Node not found or connection lost.');
    } finally { 
      setIsAuthenticating(false); 
      setGlobalLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    
    const trimmedToken = registrationToken.trim();
    if (!trimmedToken) return addNotification('ERROR', 'REQUIRED', 'Token mandatory.');

    // Check Master Key first
    if (trimmedToken === masterKey) {
      if (!defaultAdminId) {
        // Try to find the first admin if defaultAdminId is not set
        setIsAuthenticating(true);
        setGlobalLoading(true);
        try {
          const adminsSnap = await getDocs(query(collection(db, getPath('admins')), limit(1)));
          if (!adminsSnap.empty) {
            setVerifiedAdminId(adminsSnap.docs[0].id);
            setView('REG_FORM');
            addNotification('SUCCESS', 'VERIFIED', 'Master Auth granted.');
          } else {
            addNotification('ERROR', 'SYSTEM_ERROR', 'No administrator found in system.');
          }
        } finally {
          setIsAuthenticating(false);
          setGlobalLoading(false);
        }
      } else {
        setVerifiedAdminId(defaultAdminId);
        setView('REG_FORM');
        addNotification('SUCCESS', 'VERIFIED', 'Master Auth granted.');
      }
      return;
    }

    if (!registrationKeyRequired) {
      setVerifiedAdminId(defaultAdminId);
      setView('REG_FORM');
      addNotification('SUCCESS', 'VERIFIED', 'Direct registration enabled.');
      return;
    }

    setIsAuthenticating(true);
    setGlobalLoading(true);
    
    // Small delay to ensure loader is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const q = query(collection(db, getPath("registration_keys")), where("key", "==", trimmedToken));
      const snap = await getDocs(q);
      if (snap.empty) {
        addNotification('ERROR', 'INVALID', 'Token not found.');
      } else {
        const keyData = snap.docs[0].data();
        if (keyData.status !== 'ACTIVE') {
          addNotification('ERROR', 'EXPIRED', `Status: ${keyData.status}.`);
        } else if (!keyData.adminId) {
          addNotification('ERROR', 'INVALID', 'Token has no associated administrator.');
        } else {
          setVerifiedAdminId(keyData.adminId);
          setView('REG_FORM');
          addNotification('SUCCESS', 'VERIFIED', 'Auth granted.');
        }
      }
    } finally { 
      setIsAuthenticating(false); 
      setGlobalLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setGlobalLoading(true);
    
    // Small delay to ensure loader is visible
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!verifiedAdminId) {
      addNotification('ERROR', 'CONFIG_ERROR', 'Admin context missing. Please re-verify your token.');
      setIsAuthenticating(false);
      setGlobalLoading(false);
      return;
    }

    const secondaryApp = initializeApp(firebaseConfig, `reg-temp-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    const secondaryDb = getFirestore(secondaryApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, regData.email, regData.password);
      const uid = userCredential.user.uid;
      const profile = {
        uid, email: regData.email, displayName: regData.displayName, username: regData.username, phone: regData.phone, address: regData.address, photoURL: regData.photoURL || '', 
        role: UserRole.STUDENT, status: UserStatus.PENDING, adminId: verifiedAdminId, permissions: { allAccess: false, categories: [] }, bookmarks: []
      };
      await setDoc(doc(secondaryDb, getPath(`admins/${verifiedAdminId}/students`), uid), profile);
      await setDoc(doc(secondaryDb, getPath('user_mappings'), uid), { role: UserRole.STUDENT, adminId: verifiedAdminId, photoURL: regData.photoURL || '', displayName: regData.displayName });
      
      if (registrationKeyRequired && registrationToken.trim()) {
        const q = query(collection(secondaryDb, getPath("registration_keys")), where("key", "==", registrationToken.trim()));
        const keySnap = await getDocs(q);
        if (!keySnap.empty) {
          await updateDoc(doc(secondaryDb, getPath("registration_keys"), keySnap.docs[0].id), { status: 'USED', usedBy: regData.displayName, usedAt: new Date().toISOString() });
        }
      }
      
      addNotification('SUCCESS', 'COMPLETE', 'Account created. Awaiting administrator approval.');
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
      setEmail(regData.email);
      setRegData({ displayName: '', email: '', username: '', password: '', phone: '', address: '', photoURL: '' });
      setRegistrationToken('');
      setView('LOGIN');
    } catch (e: any) {
      console.error("Registration Error:", e);
      let errorMsg = e.message || 'Registration failed.';
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please use a different email or login.';
      } else if (e.message?.includes('photoURL')) {
        errorMsg = 'The profile image is too large. Please try a smaller image.';
      }
      addNotification('ERROR', 'FAILED', errorMsg);
      await deleteApp(secondaryApp).catch(() => {});
    } finally { 
      setIsAuthenticating(false); 
      setGlobalLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartRegistration = async () => {
    if (!registrationKeyRequired) {
      if (!defaultAdminId) {
        setGlobalLoading(true);
        try {
          const adminsSnap = await getDocs(query(collection(db, getPath('admins')), limit(1)));
          if (!adminsSnap.empty) {
            setVerifiedAdminId(adminsSnap.docs[0].id);
            setView('REG_FORM');
          } else {
            addNotification('ERROR', 'SYSTEM_ERROR', 'No administrator found in system.');
          }
        } catch (e) {
          addNotification('ERROR', 'SYSTEM_ERROR', 'Failed to initialize registration context.');
        } finally {
          setGlobalLoading(false);
        }
      } else {
        setVerifiedAdminId(defaultAdminId);
        setView('REG_FORM');
      }
    } else {
      setView('VERIFY_TOKEN');
    }
  };

  return (
    <div ref={scrollRef} className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto font-body text-white selection:bg-accent selection:text-black">
      
      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/10 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest hover:text-white hover:border-white/30 transition-all backdrop-blur-sm" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
        <ChevronLeft size={14} /> HOME
      </Link>

      <div className="w-full max-w-[480px] z-10 relative">
        <div className="text-center mb-6 sm:mb-10">
           <div className="flex items-center justify-center gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-accent/40"></div>
              <div className="relative">
                <ShieldCheck size={24} className="text-accent animate-pulse" />
                <div className="absolute -inset-2 border border-accent/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              </div>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-accent/40"></div>
           </div>
           <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tighter uppercase text-white truncate">{brandingName}</h1>
           <p className="text-[8px] font-heading tracking-[0.6em] text-accent/40 uppercase mt-2">
             {view === 'LOGIN' && 'User Login'}
             {view === 'VERIFY_TOKEN' && 'Authorization'}
             {view === 'REG_FORM' && 'Registration'}
             {view === 'FORGOT' && 'Recovery'}
           </p>
        </div>
        <div className="bg-[#050505] border border-white/10 relative overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>
          <div className="p-6 sm:p-10 lg:p-12 relative z-10">
            {view === 'LOGIN' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 border border-accent/20 relative">
                      <Target size={24} className="text-accent animate-pulse" />
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-accent"></div>
                    </div>
                    <div>
                      <h2 className="font-heading text-[14px] tracking-[0.3em] uppercase font-black text-white">User Authentication</h2>
                      <p className="text-[8px] text-accent/40 uppercase tracking-widest mt-1">Access Control Protocol v5.0</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2.5 group">
                    <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <Mail size={14} className="text-accent/40 group-focus-within:text-accent" />
                      EMAIL_ADDRESS
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500 pointer-events-none"></div>
                      <input 
                        required 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="ENTER EMAIL" 
                        className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase" 
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                      />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                    </div>
                  </div>

                  <div className="space-y-2.5 group">
                    <div className="flex justify-between items-center pr-1">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                        <Lock size={14} className="text-accent/40 group-focus-within:text-accent" />
                        PASSWORD
                      </label>
                      <button type="button" onClick={() => setView('FORGOT')} className="text-[8px] font-heading text-accent/40 hover:text-accent uppercase tracking-[0.2em] transition-all">[ Forgot? ]</button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500 pointer-events-none"></div>
                      <input 
                        required 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="ENTER PASSWORD" 
                        className="w-full bg-white/[0.02] border border-white/10 p-4 pl-4 pr-12 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10" 
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                      />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/30 hover:text-accent transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 space-y-6">
                    <button 
                      type="submit" 
                      disabled={isAuthenticating} 
                      className="w-full py-5 bg-white text-black font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-accent hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group" 
                      style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                    >
                      {isAuthenticating ? <Loader2 size={20} className="animate-spin" /> : <>Login <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
                    </button>
                    
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={handleStartRegistration} 
                        className="text-[9px] font-heading text-muted/30 hover:text-white uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-3 mx-auto"
                      >
                        <Plus size={14} /> [ Register ]
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {view === 'FORGOT' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-error/10 border border-error/20 relative">
                      <ShieldAlert size={24} className="text-error animate-pulse" />
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-error"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-error"></div>
                    </div>
                    <div>
                      <h2 className="font-heading text-[14px] tracking-[0.3em] uppercase font-black text-white">Forgot Password</h2>
                      <p className="text-[8px] text-error/40 uppercase tracking-widest mt-1">Reset your account access</p>
                    </div>
                  </div>
                  <button onClick={() => setView('LOGIN')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted/40 hover:text-white group">
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-8">
                  <div className="space-y-2.5 group">
                    <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-error transition-colors">
                      <Mail size={14} className="text-error/40 group-focus-within:text-error" />
                      Recovery Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-error/0 group-focus-within:bg-error/[0.02] transition-all duration-500 pointer-events-none"></div>
                      <input 
                        required 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="ENTER REGISTERED EMAIL" 
                        className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-error/50 transition-colors duration-300 placeholder:text-muted/10 uppercase" 
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                      />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-error transition-colors"></div>
                    </div>
                    <p className="text-[7px] text-muted/30 uppercase tracking-widest">A secure restoration link will be dispatched to this node.</p>
                  </div>

                  <div className="pt-4 space-y-5">
                    <button 
                      type="submit" 
                      disabled={isAuthenticating} 
                      className="w-full py-5 bg-error/10 border border-error/40 text-error font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-error hover:text-white transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group" 
                      style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                    >
                      {isAuthenticating ? <Loader2 size={20} className="animate-spin" /> : <>Reset Password <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setView('LOGIN')} 
                      className="w-full py-2 text-[9px] font-heading text-muted/30 uppercase tracking-[0.5em] hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <ChevronLeft size={14} /> [ Back ]
                    </button>
                  </div>
                </form>
              </div>
            )}

            {view === 'VERIFY_TOKEN' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 border border-accent/20 relative">
                      <Key size={24} className="text-accent animate-pulse" />
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-accent"></div>
                    </div>
                    <div>
                      <h2 className="font-heading text-[14px] tracking-[0.3em] uppercase font-black text-white">Token Verification</h2>
                      <p className="text-[8px] text-accent/40 uppercase tracking-widest mt-1">Registration Authorization Required</p>
                    </div>
                  </div>
                  <button onClick={() => setView('LOGIN')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted/40 hover:text-white group">
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleVerifyToken} className="space-y-8">
                  <div className="space-y-4 group">
                    <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <Binary size={14} className="text-accent/40 group-focus-within:text-accent" />
                      REGISTRATION_TOKEN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500 pointer-events-none"></div>
                      <input 
                        autoFocus 
                        value={registrationToken} 
                        onChange={e => setRegistrationToken(e.target.value)} 
                        placeholder="REG-XXXXXX" 
                        className="w-full bg-black border-b border-white/10 p-6 text-2xl font-heading tracking-[0.4em] outline-none focus:border-accent text-center text-accent uppercase placeholder:text-white/5" 
                      />
                    </div>
                    <p className="text-[7px] text-muted/30 uppercase tracking-widest text-center">Enter the unique authorization code provided by your administrator.</p>
                  </div>

                  <div className="pt-4 space-y-5">
                    <button 
                      type="submit" 
                      disabled={isAuthenticating} 
                      className="w-full py-5 bg-white text-black font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-accent hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group" 
                      style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                    >
                      {isAuthenticating ? <Loader2 size={20} className="animate-spin" /> : <>Verify <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setView('LOGIN')} 
                      className="w-full py-2 text-[9px] font-heading text-muted/30 uppercase tracking-[0.5em] hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <ChevronLeft size={14} /> [ Back ]
                    </button>
                  </div>
                </form>
              </div>
            )}
            {view === 'REG_FORM' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 border border-accent/20 relative">
                      <Fingerprint size={24} className="text-accent animate-pulse" />
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-accent"></div>
                    </div>
                    <div>
                      <h2 className="font-heading text-[14px] tracking-[0.3em] uppercase font-black text-white">Account Registration</h2>
                      <p className="text-[8px] text-accent/40 uppercase tracking-widest mt-1">Secure Identity Protocol v2.5</p>
                    </div>
                  </div>
                  <button onClick={() => setView('LOGIN')} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted/40 hover:text-white group">
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <form onSubmit={handleRegister} className="space-y-8">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-24 h-24 bg-black border border-white/10 p-1 relative cursor-pointer group-hover:border-accent/40 transition-all duration-500"
                        style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0 100%, 0 20%)' }}
                      >
                        <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                           {/* Scanning line effect */}
                           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/20 to-transparent h-1/2 w-full animate-[scan_2s_linear_infinite] pointer-events-none z-10"></div>
                          
                          {regData.photoURL ? (
                            <img src={regData.photoURL || undefined} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                          ) : (
                            <Camera size={28} className="text-white/10 group-hover:text-accent/40 transition-all" />
                          )}
                        </div>
                      </div>
                      {/* Corner Accents for Photo */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-accent/20 group-hover:border-accent transition-colors"></div>
                      
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-accent text-black rounded-sm shadow-glow-sm z-20">
                        <Plus size={12} strokeWidth={3} />
                      </div>
                    </div>
                    <div className="text-center">
                      <label className="text-[9px] font-heading text-accent/60 uppercase tracking-[0.3em] font-bold">Profile Image Upload</label>
                      <p className="text-[7px] text-muted/40 uppercase mt-1">Format: JPG, PNG (Max 2MB)</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    {[
                      { icon: <UserIcon size={14}/>, label: 'FULL_NAME', placeholder: 'e.g. John Doe', key: 'displayName' },
                      { icon: <Terminal size={14}/>, label: 'USERNAME', placeholder: 'e.g. johndoe123', key: 'username' },
                      { icon: <Mail size={14}/>, label: 'EMAIL_ADDRESS', placeholder: 'example@mail.com', key: 'email', type: 'email' },
                      { icon: <Lock size={14}/>, label: 'SECURE_PASSWORD', placeholder: 'Enter password', key: 'password', type: 'password' },
                      { icon: <Phone size={14}/>, label: 'CONTACT_NUMBER', placeholder: '+1XXXXXXXXXX', key: 'phone' },
                      { icon: <MapPin size={14}/>, label: 'PHYSICAL_ADDRESS', placeholder: 'City, Country', key: 'address' },
                    ].map(field => (
                      <div key={field.key} className="space-y-2.5 group">
                        <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                          <span className="text-accent/40 group-focus-within:text-accent">{field.icon}</span>
                          {field.label}
                        </label>
                        <div className="relative">
                          {/* Input Background with subtle glow */}
                          <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500 pointer-events-none"></div>
                          
                          <input 
                            required 
                            type={field.key === 'password' ? (showRegPassword ? 'text' : 'password') : (field.type || 'text')} 
                            placeholder={field.placeholder} 
                            value={(regData as any)[field.key]} 
                            onChange={e => setRegData({...regData, [field.key]: e.target.value})} 
                            className={`w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 ${field.key === 'password' ? 'pr-12' : ''}`} 
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                          />
                          
                          {/* Input Corner Accents */}
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                          
                          {field.key === 'password' && (
                            <button 
                              type="button" 
                              onClick={() => setShowRegPassword(!showRegPassword)} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/30 hover:text-accent transition-colors"
                            >
                              {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          ) || (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/5 rounded-full group-focus-within:bg-accent/60 group-focus-within:animate-pulse transition-all"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-5">
                    <button 
                      type="submit" 
                      disabled={isAuthenticating} 
                      className="w-full py-5 bg-white text-black font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-accent hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group" 
                      style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                    >
                      {isAuthenticating ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          Register
                          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setView('LOGIN')} 
                      className="w-full py-2 text-[9px] font-heading text-muted/30 uppercase tracking-[0.5em] hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <ChevronLeft size={14} /> [ Back ]
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center px-4 opacity-20"><div className="flex gap-2"><Database size={10} /><span className="text-[7px] font-heading uppercase">SECURE</span></div><div className="flex gap-2"><span className="text-[7px] font-heading uppercase">ENCRYPTED</span><ShieldCheck size={10} /></div></div>
      </div>
      <style>{` @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } } `}</style>

      {/* Image Cropper Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#050505] border border-white/10 relative flex flex-col h-[80vh] sm:h-[600px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-heading text-sm tracking-[0.2em] uppercase font-black text-white">Adjust Image</h3>
              <button onClick={handleCropCancel} className="text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative flex-1 bg-black w-full overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={{
                  containerClassName: 'bg-black',
                  mediaClassName: '',
                  cropAreaClassName: 'border-2 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]'
                }}
              />
            </div>

            <div className="p-6 space-y-6 bg-[#050505] border-t border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-heading uppercase tracking-widest text-muted">
                  <span>Zoom</span>
                  <span>{(zoom * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCropCancel}
                  className="flex-1 py-3 border border-white/10 text-muted font-heading text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex-1 py-3 bg-accent text-black font-heading text-[10px] font-black tracking-[0.2em] uppercase hover:bg-accent/90 transition-all shadow-glow-sm"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
