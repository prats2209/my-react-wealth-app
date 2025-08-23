import React, { useState, useEffect } from 'react';

// --- NEW, CORRECTED IMPORT STATEMENTS ---
import LogInIconURL from './assets/login-icon.svg';
import UserPlusIconURL from './assets/user-plus-icon.svg';
import LogOutIconURL from './assets/logout-icon.svg';
import CheckCircleIconURL from './assets/check-circle-icon.svg';
import XCircleIconURL from './assets/x-circle-icon.svg';

// --- YOUR FIREBASE CONFIGURATION (Unchanged) ---
const firebaseConfig = {
  apiKey: "AIzaSyBrWRtbL6dQ3jZstcG8TQJFBGSi5d4TWWk",
  authDomain: "my-wealth-app-9d53e.firebaseapp.com",
  projectId: "my-wealth-app-9d53e",
  storageBucket: "my-wealth-app-9d53e.firebasestorage.app",
  messagingSenderId: "1052676988478",
  appId: "1:1052676988478:web:85e66cb50bb8333178fb6f",
  measurementId: "G-7QDHM5K0GS"
};

const myAppId = firebaseConfig.projectId; 

// --- MessageBox COMPONENT (Corrected) ---
const MessageBox = ({ message, type }) => {
    if (!message) return null;
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
    const iconSrc = type === 'success' ? CheckCircleIconURL : XCircleIconURL;

    return (
        <div id="messageBox" className={`mt-4 p-3 rounded-lg border flex items-center space-x-2 ${bgColor} ${textColor}`}>
            <img src={iconSrc} alt="Status icon" className="w-5 h-5" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

const App = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [authReady, setAuthReady] = useState(false); 
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [activeView, setActiveView] = useState('login'); 
    const [dummyUsers, setDummyUsers] = useState([]);
    const [firebaseLoaded, setFirebaseLoaded] = useState(false);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null); 

    useEffect(() => {
        const loadFirebaseScripts = () => new Promise((resolve, reject) => {
            if (window.firebase) { resolve(); return; }
            const scripts = [
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
                'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
            ];
            let loaded = 0;
            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => { if (++loaded === scripts.length) resolve(); };
                script.onerror = () => reject(new Error(`Failed to load: ${src}`));
                document.head.appendChild(script);
            });
        });

        const initializeFirebaseApp = async () => {
            try {
                await loadFirebaseScripts();
                setFirebaseLoaded(true);
                const app = window.firebase.initializeApp(firebaseConfig);
                const authInstance = window.firebase.auth();
                const dbInstance = window.firebase.firestore();
                setAuth(authInstance);
                setDb(dbInstance);
                const unsubscribe = authInstance.onAuthStateChanged(user => {
                    setCurrentUser(user);
                    setUserId(user?.uid || crypto.randomUUID());
                    setAuthReady(true);
                    if (user) {
                        setActiveView('dashboard');
                        fetchDummyUsers(dbInstance); 
                    } else {
                        setActiveView('login');
                    }
                });
                return () => unsubscribe(); 
            } catch (error) {
                console.error("Firebase init error:", error);
                showTemporaryMessage(`Failed to init app: ${error.message}`, 'error');
            }
        };
        initializeFirebaseApp();
    }, []); 

    const showTemporaryMessage = (msg, type = 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000); 
    };

    const handleLogin = async () => {
        if (!email || !password) return showTemporaryMessage('Please enter both email and password');
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showTemporaryMessage('Login successful!', 'success');
            setEmail(''); setPassword('');
        } catch (error) {
            showTemporaryMessage(`Login failed: ${error.message}`);
        }
    };

    const handleRegister = async () => {
        if (!email || !password) return showTemporaryMessage('Please enter both email and password');
        if (password.length < 6) return showTemporaryMessage('Password must be at least 6 characters');
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await db.collection(`artifacts/${myAppId}/users/${userCredential.user.uid}/user_profiles`).doc(userCredential.user.uid).set({
                email: userCredential.user.email, createdAt: new Date(),
            });
            showTemporaryMessage('Registration successful! You are now logged in.', 'success');
            setEmail(''); setPassword('');
        } catch (error) {
            showTemporaryMessage(`Registration failed: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            showTemporaryMessage('Logged out successfully.', 'success');
        } catch (error) {
            showTemporaryMessage(`Logout failed: ${error.message}`);
        }
    };

    const createDummyUser = async () => {
        if (!db || !auth) return showTemporaryMessage("Application not fully initialized.", 'error');
        const dummyEmail = `dummy${Math.random().toString(36).substring(2, 9)}@example.com`;
        const dummyPassword = 'Password123!'; 
        try {
            const dummyUserCredential = await auth.createUserWithEmailAndPassword(dummyEmail, dummyPassword);
            await db.collection(`artifacts/${myAppId}/public/data/dummy_users`).add({
                uid: dummyUserCredential.user.uid, email: dummyEmail, password: dummyPassword,
                createdAt: new Date(), createdBy: currentUser?.uid || 'anonymous' 
            });
            showTemporaryMessage(`Dummy user '${dummyEmail}' created!`, 'success');
            fetchDummyUsers(db); 
        } catch (error) {
            showTemporaryMessage(`Failed to create dummy user: ${error.message}`);
        }
    };

    const fetchDummyUsers = async (dbInstance) => { 
        if (!dbInstance) return; 
        try {
            const querySnapshot = await dbInstance.collection(`artifacts/${myAppId}/public/data/dummy_users`).get();
            setDummyUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            showTemporaryMessage(`Failed to fetch dummy users: ${error.message}`);
        }
    };

    const renderContent = () => {
        if (!authReady || !firebaseLoaded) return (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-blue-600 font-medium">Initializing application...</p>
            </div>
        );

        switch (activeView) {
            case 'login':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border">
                        <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Client Login</h2></div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="loginEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                <input type="email" id="loginEmail" className="w-full px-4 py-2.5 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="loginPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                                <input type="password" id="loginPassword" className="w-full px-4 py-2.5 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2">
                                <img src={LogInIconURL} alt="Login" className="w-5 h-5" />
                                <span>Log In</span>
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button onClick={() => setActiveView('register')} className="text-blue-600 hover:underline text-sm font-medium">
                                Don't have an account? Register
                            </button>
                        </div>
                        <MessageBox message={message} type={messageType} />
                    </div>
                );
            case 'register':
                 return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border">
                        <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Register New Account</h2></div>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="registerEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                <input type="email" id="registerEmail" className="w-full px-4 py-2.5 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label htmlFor="registerPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                                <input type="password" id="registerPassword" className="w-full px-4 py-2.5 border rounded-lg" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <button onClick={handleRegister} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2">
                                <img src={UserPlusIconURL} alt="Register" className="w-5 h-5" />
                                <span>Register</span>
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button onClick={() => setActiveView('login')} className="text-blue-600 hover:underline text-sm font-medium">
                                Already have an account? Login
                            </button>
                        </div>
                        <MessageBox message={message} type={messageType} />
                    </div>
                );
            case 'dashboard':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-3xl border">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Dashboard</h2>
                        {currentUser && (
                            <div className="text-center text-gray-700 mb-6">
                                <p className="text-lg">Welcome, <span className="font-semibold text-blue-600">{currentUser.email}</span>!</p>
                                <button onClick={handleLogout} className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center mx-auto space-x-2">
                                    <img src={LogOutIconURL} alt="Logout" className="w-5 h-5" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        )}
                        <hr className="my-6" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Dummy User Creator</h3>
                        <div className="flex justify-center mb-6">
                            <button onClick={createDummyUser} className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2">
                                <img src={UserPlusIconURL} alt="Create User" className="w-5 h-5" />
                                <span>Create Dummy User</span>
                            </button>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Existing Dummy Users</h3>
                        {dummyUsers.length > 0 ? (
                            <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                                <div className="space-y-3">
                                    {dummyUsers.map((user) => (
                                        <div key={user.id} className="p-3 bg-white rounded-md border shadow-sm">
                                            <p className="text-gray-700 text-sm">
                                                <span className="font-semibold">Email:</span> <span className="font-mono text-blue-600">{user.email}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border">
                                <p className="text-gray-500">No dummy users created yet.</p>
                            </div>
                        )}
                        <MessageBox message={message} type={messageType} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-100 font-['Inter']">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <script src="https://cdn.tailwindcss.com"></script>
            {renderContent()}
        </div>
    );
};

export default App;