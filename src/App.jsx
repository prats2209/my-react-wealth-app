import React, { useState, useEffect } from 'react';
import { ReactComponent as LogInIcon } from './assets/login-icon.svg';
import { ReactComponent as UserPlusIcon } from './assets/user-plus-icon.svg';
import { ReactComponent as LogOutIcon } from './assets/logout-icon.svg';
import { ReactComponent as CheckCircleIcon } from './assets/check-circle-icon.svg';
import { ReactComponent as XCircleIcon } from './assets/x-circle-icon.svg';

// --- YOUR FIREBASE CONFIGURATION GOES HERE ---
// You MUST replace these placeholder values with YOUR ACTUAL Firebase project details.
// Get these from your Firebase Console -> Project settings -> General -> "Your apps" -> Web App config.
const firebaseConfig = {
  apiKey: "AIzaSyBrWRtbL6dQ3jZstcG8TQJFBGSi5d4TWWk",
  authDomain: "my-wealth-app-9d53e.firebaseapp.com",
  projectId: "my-wealth-app-9d53e",
  storageBucket: "my-wealth-app-9d53e.firebasestorage.app",
  messagingSenderId: "1052676988478",
  appId: "1:1052676988478:web:85e66cb50bb8333178fb6f",
  measurementId: "G-7QDHM5K0GS"
};

// Use your projectId for path construction in Firestore
const myAppId = firebaseConfig.projectId; 

// Helper component for displaying messages
const MessageBox = ({ message, type }) => {
    if (!message) return null;
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
    // Use the imported SVG components
    const Icon = type === 'success' ? CheckCircleIcon : XCircleIcon;

    return (
        <div id="messageBox" className={`mt-4 p-3 rounded-lg border flex items-center space-x-2 ${bgColor} ${textColor}`}>
            <Icon className="w-5 h-5" /> {/* Use className to style SVGs */}
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

    // State to hold Firebase service instances (initialized within useEffect)
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null); 

    // Load Firebase scripts and initialize
    useEffect(() => {
        const loadFirebaseScripts = () => {
            return new Promise((resolve, reject) => {
                // Check if Firebase is already loaded
                if (window.firebase) {
                    resolve();
                    return;
                }

                // Create script elements for Firebase
                const firebaseApp = document.createElement('script');
                firebaseApp.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
                
                const firebaseAuth = document.createElement('script');
                firebaseAuth.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js';
                
                const firebaseFirestore = document.createElement('script');
                firebaseFirestore.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js';

                let scriptsLoaded = 0;
                const totalScripts = 3;

                const onScriptLoad = () => {
                    scriptsLoaded++;
                    if (scriptsLoaded === totalScripts) {
                        resolve();
                    }
                };

                const onScriptError = () => {
                    reject(new Error('Failed to load Firebase scripts'));
                };

                firebaseApp.onload = onScriptLoad;
                firebaseApp.onerror = onScriptError;
                firebaseAuth.onload = onScriptLoad;
                firebaseAuth.onerror = onScriptError;
                firebaseFirestore.onload = onScriptLoad;
                firebaseFirestore.onerror = onScriptError;

                document.head.appendChild(firebaseApp);
                document.head.appendChild(firebaseAuth);
                document.head.appendChild(firebaseFirestore);
            });
        };

        const initializeFirebaseApp = async () => {
            try {
                await loadFirebaseScripts();
                setFirebaseLoaded(true);

                // Initialize Firebase app using compat SDK
                const app = window.firebase.initializeApp(firebaseConfig);
                const authInstance = window.firebase.auth();
                const dbInstance = window.firebase.firestore();

                setAuth(authInstance);
                setDb(dbInstance);

                // Set up the authentication state listener
                const unsubscribe = authInstance.onAuthStateChanged((user) => {
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
                console.error("Firebase initialization error:", error);
                showTemporaryMessage(`Failed to initialize app: ${error.message}`, 'error');
            }
        };

        initializeFirebaseApp();
    }, []); 

    // Helper to display temporary messages
    const showTemporaryMessage = (msg, type = 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('error'); 
        }, 5000); 
    };

    // --- Authentication Handlers ---
    const handleLogin = async () => {
        setMessage(''); 
        if (!email || !password) {
            showTemporaryMessage('Please enter both email and password');
            return;
        }
        try {
            await auth.signInWithEmailAndPassword(email, password);
            showTemporaryMessage('Login successful!', 'success');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Error logging in:", error);
            showTemporaryMessage(`Login failed: ${error.message}`);
        }
    };

    const handleRegister = async () => {
        setMessage(''); 
        if (!email || !password) {
            showTemporaryMessage('Please enter both email and password');
            return;
        }
        if (password.length < 6) {
            showTemporaryMessage('Password must be at least 6 characters');
            return;
        }
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Store user profile in Firestore (private data)
            await db.collection(`artifacts/${myAppId}/users/${user.uid}/user_profiles`).doc(user.uid).set({
                email: user.email,
                createdAt: new Date(),
            });
            showTemporaryMessage('Registration successful! You are now logged in.', 'success');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Error registering:", error);
            showTemporaryMessage(`Registration failed: ${error.message}`);
        }
    };

    const handleLogout = async () => {
        setMessage(''); 
        try {
            await auth.signOut();
            showTemporaryMessage('Logged out successfully.', 'success');
            setEmail('');
            setPassword('');
            setCurrentUser(null); 
            setDummyUsers([]); 
        } catch (error) {
            console.error("Error logging out:", error);
            showTemporaryMessage(`Logout failed: ${error.message}`);
        }
    };

    // --- Dummy User Management ---
    const createDummyUser = async () => {
        if (!db || !auth || !userId) {
            showTemporaryMessage("Application not fully initialized. Please wait.", 'error');
            return;
        }

        const dummyEmail = `dummy${Math.random().toString(36).substring(2, 9)}@example.com`;
        const dummyPassword = 'Password123!'; 

        try {
            // STEP 1: Create the user in Firebase Authentication
            const dummyUserCredential = await auth.createUserWithEmailAndPassword(dummyEmail, dummyPassword);
            const dummyAuthUser = dummyUserCredential.user;

            // STEP 2: Store the dummy user's data in Firestore (public collection)
            await db.collection(`artifacts/${myAppId}/public/data/dummy_users`).add({
                uid: dummyAuthUser.uid,
                email: dummyEmail,
                password: dummyPassword,
                createdAt: new Date(),
                createdBy: currentUser?.uid || 'anonymous' 
            });
            showTemporaryMessage(`Dummy user '${dummyEmail}' created and authenticated!`, 'success');
            fetchDummyUsers(db); 
        } catch (error) {
            console.error("Error creating dummy user:", error);
            showTemporaryMessage(`Failed to create dummy user: ${error.message}`);
        }
    };

    const fetchDummyUsers = async (dbInstance) => { 
        if (!dbInstance) return; 

        try {
            const querySnapshot = await dbInstance.collection(`artifacts/${myAppId}/public/data/dummy_users`).get();
            
            const usersList = [];
            querySnapshot.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            setDummyUsers(usersList);
        } catch (error) {
            console.error("Error fetching dummy users:", error);
            showTemporaryMessage(`Failed to fetch dummy users: ${error.message}`);
        }
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (!authReady || !firebaseLoaded) {
            return (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-blue-600 font-medium">Initializing application...</p>
                    <p className="text-gray-500 text-sm mt-2">Please ensure Firebase is configured correctly.</p>
                </div>
            );
        }

        switch (activeView) {
            case 'login':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-md border border-gray-200">
                        <div className="text-center mb-6">
                            <img src="https://placehold.co/80x80/2e609e/ffffff?text=W" alt="WealthSphere Logo" className="mx-auto mb-4 rounded-full shadow-md"/>
                            <h2 className="text-2xl font-bold text-gray-800">Client Login</h2>
                            <p className="text-gray-600 text-sm">Access your secure wealth management portal.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="loginEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    id="loginEmail"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                            <div>
                                <label htmlFor="loginPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                            >
                                <LogInIcon size={18} />
                                <span>Log In</span>
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setActiveView('register')}
                                className="text-blue-600 hover:underline text-sm font-medium hover:text-blue-700 transition-colors"
                            >
                                Don't have an account? Register
                            </button>
                        </div>
                        <MessageBox message={message} type={messageType} />
                    </div>
                );
            case 'register':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-md border border-gray-200">
                        <div className="text-center mb-6">
                            <img src="https://placehold.co/80x80/2e609e/ffffff?text=W" alt="WealthSphere Logo" className="mx-auto mb-4 rounded-full shadow-md"/>
                            <h2 className="text-2xl font-bold text-gray-800">Register New Account</h2>
                            <p className="text-gray-600 text-sm">Create your secure wealth management account.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="registerEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    id="registerEmail"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                                />
                            </div>
                            <div>
                                <label htmlFor="registerPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    id="registerPassword"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                                />
                            </div>
                            <button
                                onClick={handleRegister}
                                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                            >
                                <UserPlusIcon size={18} />
                                <span>Register</span>
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setActiveView('login')}
                                className="text-blue-600 hover:underline text-sm font-medium hover:text-blue-700 transition-colors"
                            >
                                Already have an account? Login
                            </button>
                        </div>
                        <MessageBox message={message} type={messageType} />
                    </div>
                );
            case 'dashboard':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-3xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Dashboard</h2>
                        {currentUser ? (
                            <div className="text-center text-gray-700 mb-6">
                                <p className="text-lg">Welcome, <span className="font-semibold text-blue-600">{currentUser.email}</span>!</p>
                                <p className="text-sm text-gray-500 mt-1">Your User ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{userId}</span></p>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition duration-200 flex items-center justify-center mx-auto space-x-2 shadow-md hover:shadow-lg"
                                >
                                    <LogOutIcon size={18} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">You are currently logged out or not authenticated.</p>
                        )}

                        <hr className="my-6 border-gray-300" />

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Dummy User Creator (for testing)</h3>
                        <p className="text-gray-600 text-sm mb-4 text-center max-w-2xl mx-auto">
                            Quickly create users for your bot to test login/registration workflows.
                            These users are stored in a public collection and can be used by automation tools.
                        </p>
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={createDummyUser}
                                className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                            >
                                <UserPlusIcon size={18} />
                                <span>Create Dummy User</span>
                            </button>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Existing Dummy Users</h3>
                        {dummyUsers.length > 0 ? (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                                <div className="space-y-3">
                                    {dummyUsers.map((user, index) => (
                                        <div key={user.id} className="p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-700 text-sm">
                                                        <span className="font-semibold">Email:</span> <span className="font-mono text-blue-600">{user.email}</span>
                                                    </p>
                                                    <p className="text-gray-700 text-xs">
                                                        <span className="font-semibold">Password:</span> <span className="font-mono text-green-600">Password123!</span>
                                                    </p>
                                                    <p className="text-gray-500 text-xs truncate">
                                                        <span className="font-semibold">ID:</span> <span className="font-mono">{user.id}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-gray-500">No dummy users created yet.</p>
                                <p className="text-gray-400 text-sm mt-1">Click the button above to create your first test user.</p>
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