import React, { useState } from 'react';
import LogInIconURL from './assets/login-icon.svg';
import UserPlusIconURL from './assets/user-plus-icon.svg';
import LogOutIconURL from './assets/logout-icon.svg';
import CheckCircleIconURL from './assets/check-circle-icon.svg';
import XCircleIconURL from './assets/x-circle-icon.svg';


const MessageBox = ({ message, type }) => {
    if (!message) return null;
    const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
    const iconSrc = type === 'success' ? CheckCircleIconURL : XCircleIconURL;

    return (
        <div id="messageBox" className={mt-4 p-3 rounded-lg border flex items-center space-x-2 ${bgColor} ${textColor}}>
            <img src={iconSrc} alt="Status icon" className="w-5 h-5" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

const FirebaseAuthComponent = ({ auth, db, myAppId }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [activeView, setActiveView] = useState('login');


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
            setEmail('');
            setPassword('');
        } catch (error) {
            showTemporaryMessage(Login failed: ${error.message});
        }
    };

    const handleRegister = async () => {
        if (!email || !password) return showTemporaryMessage('Please enter both email and password');
        if (password.length < 6) return showTemporaryMessage('Password must be at least 6 characters');
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await db.collection(artifacts/${myAppId}/users/${userCredential.user.uid}/user_profiles).doc(userCredential.user.uid).set({
                email: userCredential.user.email,
                createdAt: new Date(),
            });
            showTemporaryMessage('Registration successful! You are now logged in.', 'success');
            setEmail('');
            setPassword('');
        } catch (error) {
            showTemporaryMessage(Registration failed: ${error.message});
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            showTemporaryMessage('Logged out successfully.', 'success');

        } catch (error) {
            showTemporaryMessage(Logout failed: ${error.message});
        }
    };


    const renderContent = () => {
        switch (activeView) {
            case 'login':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border">
                        {/* ... login form content ... */}
                    </div>
                );
            case 'register':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border">
                        {/* ... registration form content ... */}
                    </div>
                );
            case 'dashboard':
                return (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-3xl border">
                       {/* ... dashboard content ... */}
                    </div>
                );
            default:
                return null;
        }
    };



    return (
        <div>
            {renderContent()}
        </div>
    );
};


export default FirebaseAuthComponent;