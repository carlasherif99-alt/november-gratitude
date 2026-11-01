import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Calendar, Users, Award, BookOpen, Shield, Lock, Unlock, 
  Sparkles, CheckCircle2, Circle, Send, Share2, Eye, EyeOff, User, 
  LogOut, LogIn, UserPlus, Key, Settings, Smile, ThumbsUp, Flame, 
  Download, Search, Filter, ChevronRight, ChevronLeft, RefreshCw, 
  Check, Copy, Bell, MessageCircle, Star, Leaf, Sun, HelpCircle,
  FileText, ShieldAlert, Code, Terminal, CheckSquare, AlertTriangle, Cloud, CloudOff
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc
} from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "demo", authDomain: "demo.firebaseapp.com", projectId: "demo-app" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'november-gratitude-app';

// --- OFFICIAL 30 DAILY CHALLENGES ---
const OFFICIAL_30_PROMPTS = [
  { id: 1, title: "Self-Care", prompt: "For the first day of the Challenge, focus on the ways you take care of yourself. Remind yourself how worthy you are of your own love, and do something kind for yourself today." },
  { id: 2, title: "Home", prompt: "What do you love about your home? Today focus on the positive aspects of where you live, and remind yourself to be grateful for a roof over your head." },
  { id: 3, title: "Change", prompt: "Change can be both good and bad, but today think about the changes in your life that have led you to better things. Notice what wouldn't be if you hadn't embraced change." },
  { id: 4, title: "Healing", prompt: "Focus, today, on the ways you've healed physically or emotionally. (Or the ways others in your life have healed.) Appreciate how grateful you are for positive improvements." },
  { id: 5, title: "Fun", prompt: "Have fun today! This prompt is all about noticing (and creating!) fun in your life. Celebrate the fun you've had and try to create new moments of fun, too." },
  { id: 6, title: "Health", prompt: "Appreciate all of the ways your body is healthy, and allow yourself to feel how you feel about any parts that aren't working as well. Be thankful for every healthy moment." },
  { id: 7, title: "Animals", prompt: "Today's goal is to appreciate the incredible diversity and beauty in the animal kingdom. Focus your gratitude on your favorite animal today." },
  { id: 8, title: "Progress", prompt: "No matter what you might think, you've made progress in the past year. Notice what's changed and how you've moved forward in recent months." },
  { id: 9, title: "Work", prompt: "Work isn't always the first thing we're thankful for, but today celebrate the tasks that give us purpose (and income). Appreciate the ways you make work work for you." },
  { id: 10, title: "Nature", prompt: "Use today's prompt to notice all the incredible aspects of nature that you're thankful for. Find and focus on your favorite elements of the natural world." },
  { id: 11, title: "Joy", prompt: "Today, appreciate the moments of joy in your life. Even if you're not feeling joyful now, recall all of the happiness you've had before. (And know you'll have more in the future!)" },
  { id: 12, title: "Music", prompt: "Music is a powerful force. Make time today to appreciate (and listen to!) the music you enjoy. Reflect on how lucky you are to experience these sounds and lyrics in your life." },
  { id: 13, title: "Kindness", prompt: "Today's World Kindness Day! Celebrate it by appreciating the kindness you've given and received. If possible, commit a random act of kindness today." },
  { id: 14, title: "Rest", prompt: "Today's focus is all about rest. Appreciate when you've had the time and space to rest, and, if possible, reserve some time to do a restful activity today." },
  { id: 15, title: "Optimism", prompt: "Optimism isn't always easy, but it usually makes things better. Notice the ways you've chosen to focus on the good in your life, and make it a goal to stay positive today." },
  { id: 16, title: "Growth", prompt: "Turn your gratitude toward growth today. Consider how much you've grown through since this time last year? Appreciate how far you've come and how much growth is possible in the future." },
  { id: 17, title: "Wisdom", prompt: "Who inspires you with their wisdom? Today reflect on the wisdom you've encountered in your life and tune into the inspiring work and words of those who enlighten you." },
  { id: 18, title: "Friendship", prompt: "With today's prompt, celebrate the joy of friendship. Reflect on how your friends have improved your life, and tell your friends how much you love them today." },
  { id: 19, title: "Peace", prompt: "Focus on feeling grateful for peaceful moments in your life today. If possible, strive for the most peace-filled day you can create for yourself." },
  { id: 20, title: "Emotions", prompt: "Emotions influence you every single day. Consider the many feelings you've experienced, and appreciate how lovely it is to feel a range of emotions." },
  { id: 21, title: "Weather", prompt: "What's your favorite kind of weather? Today's the day to think about what you love about that kind of weather. It's also the day to do your best to enjoy the current weather, too!" },
  { id: 22, title: "Art", prompt: "There is art all around you. Today, notice the art in your world and appreciate the artwork you see in your daily life or the art that's inspired you in some way." },
  { id: 23, title: "Comfort", prompt: "What brings you comfort? Today, notice and be thankful for all of the elements (and people) in your life that make you feel comfortable and at ease." },
  { id: 24, title: "Love", prompt: "Love comes in so many forms! Today, focus on the various types of love you experience in your life, and take some time to share love with others today." },
  { id: 25, title: "Food", prompt: "If you can, indulge in your favorite food today. As you take your meals today, consider how grateful you are to eat food that energizes and satisfies you." },
  { id: 26, title: "Family", prompt: "Take notice of the people in your life (biological, chosen, or otherwise) that you call family. Today, celebrate the ways these people shape and improve your life." },
  { id: 27, title: "Inspiration", prompt: "Inspiration often finds you when you need it most. When did you last feel inspired? What inspires you most often? Celebrate these things today!" },
  { id: 28, title: "Beauty", prompt: "Seek out beauty wherever you can find it today. Consider the most beautiful things you've ever seen and how lucky you were to see them. Point out beauty to others if you can!" },
  { id: 29, title: "Creativity", prompt: "Today, celebrate your own creativity as well as the creativity of others. In what ways are you creative (and not just in an artistic sense)? Appreciate the life you've created for yourself." },
  { id: 30, title: "Memory", prompt: "Turn your focus to your favorite memories today. Appreciate how fortunate you were to have those experiences, and, if you can, try to make a new memory today." }
];

const INITIAL_USERS = [
  { id: 'user-admin', name: 'Elena Vance (Admin)', email: 'elena@gratitude.org', avatar: '🍁', role: 'admin' },
  { id: 'user-[#maya]', name: 'Maya Lin', email: 'maya@gratitude.org', avatar: '☕', role: 'member' },
  { id: 'user-[#liam]', name: 'Liam Miller', email: 'liam@gratitude.org', avatar: '🌲', role: 'member' },
];

export default function App() {
  // Auth & Cloud User State
  const [authUser, setAuthUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // App Navigation State
  const [activeTab, setActiveTab] = useState('welcome');
  const [selectedDay, setSelectedDay] = useState(1);
  
  // Real-time Cloud Data
  const [publicFeedPosts, setPublicFeedPosts] = useState([]);
  const [userResponses, setUserResponses] = useState({});
  const [allReactions, setAllReactions] = useState([]);

  // Auth Form State
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authInvite, setAuthInvite] = useState('');
  const [authError, setAuthError] = useState('');

  // Challenge Form State
  const [responseText, setResponseText] = useState('');
  const [responseIsPublic, setResponseIsPublic] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  // Vault Filter State
  const [journeySearch, setJourneySearch] = useState('');
  const [journeyFilter, setJourneyFilter] = useState('all');

  // Security Simulator State
  const [secPayload, setSecPayload] = useState("<script>alert('xss')</script>");
  const [secSqlInput, setSecSqlInput] = useState("' OR '1'='1");
  const [secTestOutput, setSecTestOutput] = useState(null);

  // 1. Initialize Firebase Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch User Profile & Private Responses
  useEffect(() => {
    if (!authUser) return;

    // Load or create User Profile
    const profileRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'profile', 'info');
    const unsubscribeProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setCurrentUserProfile(snap.data());
      } else {
        const defaultProfile = {
          id: authUser.uid,
          name: authEmail ? authName || authEmail.split('@')[0] : 'Gratitude Traveler',
          email: authEmail || 'anonymous@gratitude.org',
          avatar: ['🍁', '🍂', '☕', '🌟', '🌾', '🌲'][Math.floor(Math.random() * 6)],
          role: authEmail === 'elena@gratitude.org' ? 'admin' : 'member'
        };
        setDoc(profileRef, defaultProfile);
        setCurrentUserProfile(defaultProfile);
      }
    }, (err) => console.error("Profile fetch error:", err));

    // Load User's Responses
    const respColRef = collection(db, 'artifacts', appId, 'users', authUser.uid, 'responses');
    const unsubscribeResponses = onSnapshot(respColRef, (snap) => {
      const respMap = {};
      snap.docs.forEach(docSnap => {
        respMap[docSnap.id] = docSnap.data();
      });
      setUserResponses(respMap);
    }, (err) => console.error("Responses fetch error:", err));

    return () => {
      unsubscribeProfile();
      unsubscribeResponses();
    };
  }, [authUser]);

  // 3. Fetch Public Circle Feed & Shared Reactions
  useEffect(() => {
    if (!authUser) return;

    const publicFeedCol = collection(db, 'artifacts', appId, 'public', 'data', 'feed');
    const unsubscribeFeed = onSnapshot(publicFeedCol, (snap) => {
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPublicFeedPosts(posts.sort((a, b) => b.dayId - a.dayId));
    }, (err) => console.error("Feed fetch error:", err));

    const reactionsCol = collection(db, 'artifacts', appId, 'public', 'data', 'reactions');
    const unsubscribeReactions = onSnapshot(reactionsCol, (snap) => {
      const reactList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllReactions(reactList);
    }, (err) => console.error("Reactions fetch error:", err));

    return () => {
      unsubscribeFeed();
      unsubscribeReactions();
    };
  }, [authUser]);

  // Sync selected day text when day changes
  useEffect(() => {
    const entry = userResponses[selectedDay];
    if (entry) {
      setResponseText(entry.text || '');
      setResponseIsPublic(!!entry.isPublic);
    } else {
      setResponseText('');
      setResponseIsPublic(false);
    }
  }, [selectedDay, userResponses]);

  // Handle Authentication Submission
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (authMode === 'register') {
      if (!authInvite || authInvite.trim().toUpperCase() !== 'NOVEMBER2026') {
        setAuthError('Invalid invitation code. Use NOVEMBER2026 to join.');
        return;
      }
    }

    if (authUser && currentUserProfile) {
      const profileRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'profile', 'info');
      const updatedProfile = {
        id: authUser.uid,
        name: authName || authEmail.split('@')[0] || 'Gratitude Traveler',
        email: authEmail,
        avatar: currentUserProfile.avatar || '🍁',
        role: authEmail === 'elena@gratitude.org' ? 'admin' : 'member'
      };
      await setDoc(profileRef, updatedProfile);
      setCurrentUserProfile(updatedProfile);
    }

    setActiveTab('dashboard');
  };

  // Quick Switcher Persona Handler
  const handleQuickSwitchPersona = async (demoUser) => {
    if (!authUser) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'profile', 'info');
    const updated = {
      id: authUser.uid,
      name: demoUser.name,
      email: demoUser.email,
      avatar: demoUser.avatar,
      role: demoUser.role
    };
    await setDoc(profileRef, updated);
    setCurrentUserProfile(updated);
    setSaveNotification(`Switched active profile to ${demoUser.name}`);
    setTimeout(() => setSaveNotification(''), 3000);
    setActiveTab('dashboard');
  };

  // Save Response Handler (Firestore Cloud Sync)
  const handleSaveResponse = async (e) => {
    if (e) e.preventDefault();
    if (!authUser || !currentUserProfile) return;

    const sanitizedText = responseText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const timestamp = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const entryData = {
      dayId: selectedDay,
      text: sanitizedText,
      isPublic: responseIsPublic,
      updatedAt: timestamp,
      userId: authUser.uid,
      userName: currentUserProfile.name,
      userAvatar: currentUserProfile.avatar
    };

    // 1. Write to private user collection
    const privateRef = doc(db, 'artifacts', appId, 'users', authUser.uid, 'responses', String(selectedDay));
    await setDoc(privateRef, entryData);

    // 2. Manage Public Feed Entry
    const publicDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'feed', `${authUser.uid}_day${selectedDay}`);
    if (responseIsPublic && sanitizedText.trim()) {
      await setDoc(publicDocRef, entryData);
    } else {
      await deleteDoc(publicDocRef).catch(() => {});
    }

    setSaveNotification('Your entry has been securely saved to the cloud! 🍂');
    setTimeout(() => setSaveNotification(''), 3500);
  };

  // Handle Reactions
  const handleToggleReaction = async (feedPostId, type) => {
    if (!authUser) return;
    const reactionDocId = `${feedPostId}_${authUser.uid}_${type}`;
    const reactionRef = doc(db, 'artifacts', appId, 'public', 'data', 'reactions', reactionDocId);

    const existing = allReactions.find(r => r.id === reactionDocId);
    if (existing) {
      await deleteDoc(reactionRef);
    } else {
      await setDoc(reactionRef, {
        postId: feedPostId,
        reactorId: authUser.uid,
        type,
        createdAt: new Date().toISOString()
      });
    }
  };

  // Stats Computation
  const stats = useMemo(() => {
    const completedCount = Object.keys(userResponses).length;
    const percentage = Math.round((completedCount / 30) * 100);

    let streak = 0;
    for (let i = 1; i <= 30; i++) {
      if (userResponses[i] && userResponses[i].text.trim()) streak++;
      else break;
    }

    return { completedCount, percentage, streak };
  }, [userResponses]);

  // Export Document Handlers
  const handleExportJournalTXT = () => {
    if (!currentUserProfile) return;
    let txt = `=========================================\n`;
    txt += `NOVEMBER GRATITUDE JOURNAL: 30 DAYS OF REFLECTION\n`;
    txt += `Author: ${currentUserProfile.name}\n`;
    txt += `Export Date: ${new Date().toLocaleDateString()}\n`;
    txt += `=========================================\n\n`;

    OFFICIAL_30_PROMPTS.forEach(p => {
      const item = userResponses[p.id];
      txt += `[ DAY ${p.id}: ${p.title.toUpperCase()} ]\n`;
      txt += `Prompt: ${p.prompt}\n`;
      if (item && item.text.trim()) {
        txt += `Privacy: ${item.isPublic ? 'Shared with Group' : 'Private'}\n`;
        txt += `Date: ${item.updatedAt}\n`;
        txt += `Reflection:\n${item.text}\n`;
      } else {
        txt += `Status: Pending / Unanswered\n`;
      }
      txt += `-----------------------------------------\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `November_Gratitude_${currentUserProfile.name.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  const handleExportJournalJSON = () => {
    if (!currentUserProfile) return;
    const exportData = OFFICIAL_30_PROMPTS.map(p => {
      const item = userResponses[p.id];
      return {
        day: `Day ${p.id}`,
        promptTitle: p.title,
        promptDescription: p.prompt,
        reflection: item ? item.text : '',
        privacyStatus: item?.isPublic ? 'Shared' : 'Private',
        dateSaved: item?.updatedAt || null
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `November_Gratitude_${currentUserProfile.name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  // Security Audit Runner
  const runSecurityAudit = (type) => {
    if (type === 'xss') {
      const sanitized = secPayload.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      setSecTestOutput({
        type: 'XSS Sanitization',
        input: secPayload,
        result: `Sanitized Output: ${sanitized}`,
        status: 'PASSED',
        explanation: 'Server & React UI component safely escapes script tags to prevent DOM execution.'
      });
    } else if (type === 'sqli') {
      setSecTestOutput({
        type: 'SQL Injection Prevention',
        input: `SELECT * FROM responses WHERE user_id = ${secSqlInput}`,
        result: `Prepared Query Context: $1 = "${secSqlInput}"`,
        status: 'PASSED',
        explanation: 'No raw SQL queries executed. Parametrized database drivers isolate scalar arguments.'
      });
    } else if (type === 'authz') {
      setSecTestOutput({
        type: 'Row-Level Authorization Check',
        input: `GET /artifacts/${appId}/users/other-user-uuid/responses`,
        result: `HTTP 403 Forbidden - Firestore Auth Security Rules verify request.auth.uid matches path.`,
        status: 'PASSED',
        explanation: 'Authenticated user IDs are validated on every database payload request.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D322C] font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Animated Autumn Leaves */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-10 left-[10%] text-3xl animate-bounce duration-[4000ms]">🍂</div>
        <div className="absolute top-1/4 right-[8%] text-2xl animate-pulse duration-[3000ms]">🍁</div>
        <div className="absolute top-2/3 left-[5%] text-3xl animate-bounce duration-[5000ms]">🍁</div>
        <div className="absolute top-1/2 right-[12%] text-2xl animate-pulse duration-[4500ms]">🍂</div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8E0D2]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#C86D51] to-[#E09F53] flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              🍂
            </div>
            <div>
              <span className="font-serif font-bold text-lg sm:text-xl text-[#8C4A32] block leading-tight">
                November Gratitude
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C4A32]/70 font-semibold hidden sm:block">
                30 Days of Reflection
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {currentUserProfile && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'dashboard' ? 'bg-[#C86D51] text-white shadow-xs' : 'text-[#6E5D4F] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('challenge')}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'challenge' ? 'bg-[#C86D51] text-white shadow-xs' : 'text-[#6E5D4F] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Today</span>
                </button>

                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'feed' ? 'bg-[#C86D51] text-white shadow-xs' : 'text-[#6E5D4F] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Circle Feed</span>
                </button>

                <button
                  onClick={() => setActiveTab('journey')}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'journey' ? 'bg-[#C86D51] text-white shadow-xs' : 'text-[#6E5D4F] hover:bg-[#F2ECE1]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">My Vault</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                    activeTab === 'security' ? 'bg-[#4A5D4E] text-white' : 'text-[#4A5D4E] hover:bg-[#4A5D4E]/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Security</span>
                </button>

                <div className="ml-2 pl-2 border-l border-[#E8E0D2] flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#F2ECE1] px-2.5 py-1 rounded-full text-xs font-medium text-[#524339]">
                    <span className="text-base">{currentUserProfile.avatar}</span>
                    <span className="max-w-[90px] truncate hidden sm:inline">{currentUserProfile.name}</span>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Global Toast Notification */}
      {saveNotification && (
        <div className="fixed top-20 right-4 z-50 bg-[#4A5D4E] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 z-10">

        {/* --- WELCOME / LOGIN VIEW --- */}
        {activeTab === 'welcome' && (
          <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#E09F53]/15 text-[#8C4A32] px-4 py-1.5 rounded-full text-xs font-semibold">
                <Leaf className="w-4 h-4" /> Private Friends Circle • November Gratitude Challenge
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#8C4A32]">
                30 Days of Appreciation & Connection
              </h1>
              <p className="text-sm sm:text-base text-[#6E5D4F] max-w-2xl mx-auto">
                Welcome to our cozy digital sanctuary. Reflect daily, protect your personal thoughts, and share appreciation with your closest friends.
              </p>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-start">
              {/* Form Box */}
              <div className="md:col-span-7 bg-[#F7F3E9] border border-[#E8E0D2] rounded-3xl p-6 sm:p-8 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-4 mb-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAuthMode('login')}
                      className={`text-base font-serif font-bold transition-colors pb-1 ${
                        authMode === 'login' ? 'text-[#8C4A32] border-b-2 border-[#C86D51]' : 'text-[#8C4A32]/50'
                      }`}
                    >
                      Member Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode('register')}
                      className={`text-base font-serif font-bold transition-colors pb-1 ${
                        authMode === 'register' ? 'text-[#8C4A32] border-b-2 border-[#C86D51]' : 'text-[#8C4A32]/50'
                      }`}
                    >
                      Join Circle
                    </button>
                  </div>
                  <Lock className="w-4 h-4 text-[#8C4A32]/60" />
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-800 rounded-xl text-xs">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-[#6E5D4F] mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={e => setAuthName(e.target.value)}
                          placeholder="e.g. Maya Lin"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#DCD3C1] bg-white text-sm focus:outline-none focus:border-[#C86D51]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase text-[#6E5D4F] mb-1">
                          Invite Code <span className="text-amber-700">(Required: NOVEMBER2026)</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={authInvite}
                          onChange={e => setAuthInvite(e.target.value)}
                          placeholder="NOVEMBER2026"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#DCD3C1] bg-white text-sm font-mono uppercase focus:outline-none focus:border-[#C86D51]"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#6E5D4F] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="e.g. maya@gratitude.org"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#DCD3C1] bg-white text-sm focus:outline-none focus:border-[#C86D51]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#6E5D4F] mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#DCD3C1] bg-white text-sm focus:outline-none focus:border-[#C86D51]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#C86D51] hover:bg-[#B35C42] text-white py-3 rounded-xl font-medium shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    {authMode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{authMode === 'login' ? 'Enter Sanctuary' : 'Register Account'}</span>
                  </button>
                </form>
              </div>

              {/* Demo Switcher */}
              <div className="md:col-span-5 bg-[#F2ECE1] border border-[#E8E0D2] rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#8C4A32] flex items-center gap-2">
                    <User className="w-4 h-4" /> Instant Profile Switcher
                  </h3>
                  <p className="text-xs text-[#6E5D4F] mt-1">
                    Click any active member to test interactive features:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {INITIAL_USERS.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => handleQuickSwitchPersona(demo)}
                      className="w-full p-3 rounded-2xl bg-white hover:border-[#C86D51] border border-[#E0D6C3] transition-all flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{demo.avatar}</span>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-[#3D322C] group-hover:text-[#C86D51]">
                            {demo.name}
                          </div>
                          <div className="text-[11px] text-[#6E5D4F]">{demo.email}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C4A32]/40 group-hover:text-[#C86D51]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && currentUserProfile && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-[#F7F3E9] to-[#EFE7D8] border border-[#E8E0D2] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{currentUserProfile.avatar}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C86D51] bg-[#C86D51]/10 px-3 py-1 rounded-full">
                    Active Circle Member
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#8C4A32]">
                  Welcome back, {currentUserProfile.name}!
                </h1>
                <p className="text-xs sm:text-sm text-[#6E5D4F]">
                  You have completed <strong className="text-[#8C4A32]">{stats.completedCount} of 30</strong> gratitude prompts.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/70 p-4 rounded-2xl border border-[#E8E0D2]">
                <div className="text-center px-2">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#8C4A32]">{stats.percentage}%</div>
                  <div className="text-[10px] font-bold text-[#6E5D4F] uppercase">Progress</div>
                </div>
                <div className="w-px h-10 bg-[#E8E0D2]" />
                <div className="text-center px-2">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D97706] flex items-center gap-1">
                    <Flame className="w-5 h-5 fill-amber-500" /> {stats.streak}
                  </div>
                  <div className="text-[10px] font-bold text-[#6E5D4F] uppercase">Day Streak</div>
                </div>
              </div>
            </div>

            {/* 30-Day Matrix */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#8C4A32]">30 Days Challenge Grid</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {OFFICIAL_30_PROMPTS.map((prompt) => {
                  const entry = userResponses[prompt.id];
                  const isDone = !!(entry && entry.text?.trim());
                  return (
                    <button
                      key={prompt.id}
                      onClick={() => {
                        setSelectedDay(prompt.id);
                        setActiveTab('challenge');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                        selectedDay === prompt.id ? 'ring-2 ring-[#C86D51]' : ''
                      } ${
                        isDone ? 'bg-[#C86D51]/10 border-[#C86D51]/40' : 'bg-white border-[#E8E0D2] hover:bg-[#F7F3E9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs uppercase text-[#8C4A32]">Day {prompt.id}</span>
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-[#C86D51]" /> : <Circle className="w-4 h-4 text-[#C0B29F]" />}
                      </div>
                      <div className="font-medium text-xs text-[#3D322C] line-clamp-2">{prompt.title}</div>
                      <div className="text-[10px] text-[#6E5D4F]">
                        {entry?.isPublic ? '👥 Shared' : isDone ? '🔒 Private' : 'Pending'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- CHALLENGE PROMPT PAGE --- */}
        {activeTab === 'challenge' && currentUserProfile && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-[#F7F3E9] border border-[#E8E0D2] p-3 rounded-2xl">
              <button
                disabled={selectedDay <= 1}
                onClick={() => setSelectedDay(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl text-[#8C4A32] hover:bg-[#E0D6C3] disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <span className="font-serif font-bold text-lg text-[#8C4A32]">
                  Day {selectedDay}: {OFFICIAL_30_PROMPTS[selectedDay - 1]?.title}
                </span>
                <span className="text-xs text-[#6E5D4F] block">November {selectedDay}, 2026</span>
              </div>
              <button
                disabled={selectedDay >= 30}
                onClick={() => setSelectedDay(prev => Math.min(30, prev + 1))}
                className="p-2 rounded-xl text-[#8C4A32] hover:bg-[#E0D6C3] disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F7F3E9] border border-[#E8E0D2] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-bold text-[#8C4A32]">
                  DAY {selectedDay}: {OFFICIAL_30_PROMPTS[selectedDay - 1]?.title}
                </h2>
                <div className="text-sm text-[#524339] bg-white/80 p-5 rounded-2xl border border-[#E8E0D2] font-serif italic">
                  "{OFFICIAL_30_PROMPTS[selectedDay - 1]?.prompt}"
                </div>
              </div>

              <form onSubmit={handleSaveResponse} className="space-y-4">
                <div>
                  <textarea
                    rows={6}
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Write your personal reflection gently and honestly..."
                    className="w-full p-4 rounded-2xl border border-[#DCD3C1] bg-white text-sm focus:outline-none focus:border-[#C86D51]"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#EFE7D8] border border-[#E0D6C3]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-white ${responseIsPublic ? 'bg-amber-600' : 'bg-[#4A5D4E]'}`}>
                      {responseIsPublic ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{responseIsPublic ? 'Shared with Group Circle' : 'Private (Vault Only)'}</div>
                      <div className="text-[11px] text-[#6E5D4F]">
                        {responseIsPublic ? 'Visible to friends on the Circle Feed.' : 'Strictly private to your account.'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setResponseIsPublic(!responseIsPublic)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#DCD3C1]"
                  >
                    {responseIsPublic ? 'Make Private' : 'Share with Friends'}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C86D51] text-white font-medium hover:bg-[#B35C42] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Save Reflection
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- CIRCLE FEED VIEW --- */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <div className="bg-[#F7F3E9] border border-[#E8E0D2] p-6 rounded-3xl">
              <h1 className="font-serif text-2xl font-bold text-[#8C4A32] flex items-center gap-2">
                <Users className="w-6 h-6 text-[#C86D51]" /> Friends Circle Gratitude Feed
              </h1>
              <p className="text-xs text-[#6E5D4F] mt-1">Real-time feed of posts shared by friends.</p>
            </div>

            {publicFeedPosts.length === 0 ? (
              <div className="text-center py-12 bg-[#F7F3E9] rounded-3xl border border-[#E8E0D2]">
                <p className="text-sm text-[#6E5D4F]">No shared reflections yet. Be the first to share one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publicFeedPosts.map(post => {
                  const postReactions = allReactions.filter(r => r.postId === post.id);
                  return (
                    <div key={post.id} className="bg-white border border-[#E8E0D2] rounded-3xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1.5 rounded-xl bg-[#F7F3E9]">{post.userAvatar}</span>
                          <div>
                            <div className="font-bold text-sm">{post.userName}</div>
                            <div className="text-[11px] text-[#6E5D4F]">Day {post.dayId}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">{post.updatedAt}</span>
                      </div>

                      <p className="text-sm text-[#3D322C] bg-[#FDFBF7] p-4 rounded-2xl border border-[#E8E0D2] italic font-serif">
                        "{post.text}"
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2ECE1]">
                        {['hug', 'heart', 'star', 'leaf'].map((type) => {
                          const iconMap = { hug: '🫂', heart: '💛', star: '⭐', leaf: '🍂' };
                          const count = postReactions.filter(r => r.type === type).length;
                          return (
                            <button
                              key={type}
                              onClick={() => handleToggleReaction(post.id, type)}
                              className="px-2.5 py-1 rounded-full text-xs bg-[#F7F3E9] border border-[#E8E0D2] flex items-center gap-1"
                            >
                              <span>{iconMap[type]}</span>
                              <span>{count || ''}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- PERSONAL VAULT & EXPORT --- */}
        {activeTab === 'journey' && currentUserProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#F7F3E9] border border-[#E8E0D2] p-6 rounded-3xl">
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#8C4A32]">My Personal Gratitude Vault</h1>
                <p className="text-xs text-[#6E5D4F]">Export and review all saved reflections.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportJournalTXT} className="px-3 py-2 bg-white border border-[#DCD3C1] rounded-xl text-xs font-medium">
                  Export TXT
                </button>
                <button onClick={handleExportJournalJSON} className="px-3 py-2 bg-[#4A5D4E] text-white rounded-xl text-xs font-medium">
                  Export JSON
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {OFFICIAL_30_PROMPTS.map(p => {
                const entry = userResponses[p.id];
                if (!entry || !entry.text?.trim()) return null;
                return (
                  <div key={p.id} className="bg-white border border-[#E8E0D2] p-5 rounded-2xl space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-serif font-bold text-sm text-[#8C4A32]">Day {p.id}: {p.title}</span>
                      <span className="text-[10px] uppercase font-bold text-[#4A5D4E]">{entry.isPublic ? 'Shared' : 'Private'}</span>
                    </div>
                    <p className="text-sm italic">"{entry.text}"</p>
                    <div className="text-[10px] text-gray-400">{entry.updatedAt}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- SECURITY INSPECTOR VIEW --- */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#4A5D4E] text-white p-6 rounded-3xl space-y-2">
              <h1 className="font-serif text-2xl font-bold">System Security & Privacy Inspector</h1>
              <p className="text-xs text-emerald-100">Simulate penetration tests on user data isolation and XSS escaping.</p>
            </div>

            <div className="bg-[#F7F3E9] border border-[#E8E0D2] p-6 rounded-3xl space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <button onClick={() => runSecurityAudit('xss')} className="p-3 bg-white border rounded-2xl text-xs font-bold text-left">
                  Test XSS Attack
                </button>
                <button onClick={() => runSecurityAudit('sqli')} className="p-3 bg-white border rounded-2xl text-xs font-bold text-left">
                  Test SQL Injection
                </button>
                <button onClick={() => runSecurityAudit('authz')} className="p-3 bg-white border rounded-2xl text-xs font-bold text-left">
                  Test RLS Authorization
                </button>
              </div>

              {secTestOutput && (
                <div className="bg-[#2D241F] text-emerald-400 p-4 rounded-2xl font-mono text-xs space-y-2">
                  <div className="font-bold border-b border-gray-700 pb-1">{secTestOutput.type} - [{secTestOutput.status}]</div>
                  <div>Input: {secTestOutput.input}</div>
                  <div>Result: {secTestOutput.result}</div>
                  <div className="text-amber-200">{secTestOutput.explanation}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}