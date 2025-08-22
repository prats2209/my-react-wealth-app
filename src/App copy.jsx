import React, { useState, useEffect } from 'react';
import { 
    initializeApp 
} from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs,
    doc, 
    setDoc 
} from 'firebase/firestore';
import { LogIn, UserPlus, LogOut, CheckCircle, XCircle } from 'lucide-react'; // For icons

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
    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        // Added id="messageBox" here so Selenium can easily find it
        <div id="messageBox" className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${bgColor} ${textColor}`}>
            <Icon size={20} />
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

    // State to hold Firebase service instances (initialized within useEffect)
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null); 

    // --- Firebase Initialization and Auth Listener ---
    useEffect(() => {
        const initializeFirebaseApp = async () => {
            try {
                // Initialize Firebase app
                const appInstance = initializeApp(firebaseConfig);
                const authInstance = getAuth(appInstance);
                const dbInstance = getFirestore(appInstance);

                setAuth(authInstance);
                setDb(dbInstance);

                // Set up the authentication state listener first
                const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                    setCurrentUser(user);
                    // Use user.uid if authenticated, otherwise a random ID for anonymous operations
                    setUserId(user?.uid || crypto.randomUUID());
                    setAuthReady(true); // Mark auth as ready after initial check
                    // Automatically switch to dashboard if user is logged in
                    if (user) {
                        setActiveView('dashboard');
                        // Fetch dummy users only when a user is authenticated (can access Firestore)
                        fetchDummyUsers(dbInstance); 
                    } else {
                        setActiveView('login'); // Go back to login if logged out
                    }
                });

                // Cleanup the listener when the component unmounts
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
    const handleLogin = async (e) => {
        e.preventDefault(); 
        setMessage(''); 
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showTemporaryMessage('Login successful!', 'success');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Error logging in:", error);
            showTemporaryMessage(`Login failed: ${error.message}`);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault(); 
        setMessage(''); 
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Store user profile in Firestore (private data)
            // Path: artifacts/{myAppId}/users/{userId}/user_profiles/{docId}
            const userProfileRef = doc(db, `artifacts/${myAppId}/users/${user.uid}/user_profiles`, user.uid);
            await setDoc(userProfileRef, {
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
            await signOut(auth);
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
            const dummyUserCredential = await createUserWithEmailAndPassword(auth, dummyEmail, dummyPassword);
            const dummyAuthUser = dummyUserCredential.user;

            // STEP 2: Store the dummy user's data in Firestore (public collection)
            const dummyUserRef = collection(db, `artifacts/${myAppId}/public/data/dummy_users`);
            await addDoc(dummyUserRef, {
                uid: dummyAuthUser.uid, // Store the Firebase Auth UID
                email: dummyEmail,
                password: dummyPassword, // Still storing for testing display, but the auth is what matters
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
            const dummyUsersCollectionRef = collection(dbInstance, `artifacts/${myAppId}/public/data/dummy_users`);
            const querySnapshot = await getDocs(dummyUsersCollectionRef);
            
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
        if (!authReady) {
            return (
                <div className="text-center p-8">
                    <p className="text-lg text-blue-600">Initializing application...</p>
                    <p className="text-gray-500 text-sm mt-2">Please ensure Firebase is configured correctly.</p>
                </div>
            );
        }

        switch (activeView) {
            case 'login':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-md border border-gray-200">
                        <div className="text-center mb-6">
                            <img src="https://placehold.co/80x80/2e609e/ffffff?text=W" alt="WealthSphere Logo" className="mx-auto mb-4 rounded-full"/>
                            <h2 className="text-2xl font-bold text-gray-800">Client Login</h2>
                            <p className="text-gray-600 text-sm">Access your secure wealth management portal.</p>
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="loginEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    id="loginEmail"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div>
                                <label htmlFor="loginPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                            >
                                <LogIn size={18} />
                                <span>Log In</span>
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setActiveView('register')}
                                className="text-blue-600 hover:underline text-sm font-medium"
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
                            <img src="https://placehold.co/80x80/2e609e/ffffff?text=W" alt="WealthSphere Logo" className="mx-auto mb-4 rounded-full"/>
                            <h2 className="text-2xl font-bold text-gray-800">Register New Account</h2>
                            <p className="text-gray-600 text-sm">Create your secure wealth management account.</p>
                        </div>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label htmlFor="registerEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    id="registerEmail"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div>
                                <label htmlFor="registerPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    id="registerPassword"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Minimum 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="6"
                                    autoComplete="new-password"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                            >
                                <UserPlus size={18} />
                                <span>Register</span>
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setActiveView('login')}
                                className="text-blue-600 hover:underline text-sm font-medium"
                            >
                                Already have an account? Login
                            </button>
                        </div>
                        <MessageBox message={message} type={messageType} />
                    </div>
                );
            case 'dashboard':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-2xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Dashboard</h2>
                        {currentUser ? (
                            <div className="text-center text-gray-700 mb-6">
                                <p className="text-lg">Welcome, <span className="font-semibold">{currentUser.email}</span>!</p>
                                <p className="text-sm text-gray-500 mt-1">Your User ID: <span className="font-mono break-all">{userId}</span></p>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition duration-200 flex items-center justify-center mx-auto space-x-2 transform hover:scale-105"
                                >
                                    <LogOut size={18} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">You are currently logged out or not authenticated.</p>
                        )}

                        <hr className="my-6 border-gray-300" />

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Dummy User Creator (for testing)</h3>
                        <p className="text-gray-600 text-sm mb-4 text-center">
                            Quickly create users for your bot to test login/registration workflows.
                            These users are stored in a public collection (`artifacts/{myAppId}/public/data/dummy_users`).
                        </p>
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={createDummyUser}
                                className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
                            >
                                <UserPlus size={18} />
                                <span>Create Dummy User</span>
                            </button>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Existing Dummy Users</h3>
                        {dummyUsers.length > 0 ? (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                                <ul className="list-disc list-inside space-y-2">
                                    {dummyUsers.map((user, index) => (
                                        <li key={user.id} className="p-2 bg-white rounded-md border border-gray-100 shadow-sm">
                                            <p className="text-gray-700 text-sm">
                                                <span className="font-semibold">Email:</span> {user.email}
                                            </p>
                                            <p className="text-gray-700 text-xs text-gray-500">
                                                <span className="font-semibold">Password:</span> Password123!
                                            </p>
                                            <p className="text-gray-700 text-xs text-gray-500">
                                                <span className="font-semibold">ID:</span> {user.id}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 text-sm">No dummy users created yet.</p>
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
            {/* These links are important for styling and font, include them for local development */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <script src="https://cdn.tailwindcss.com"></script>
            {renderContent()}
        </div>
    );
};

export default App;