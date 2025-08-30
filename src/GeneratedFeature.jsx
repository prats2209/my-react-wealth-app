import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogInIconURL from './assets/login-icon.svg';
import MessageBox from './MessageBox'; // Assuming MessageBox is in a separate file


const ClientLoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const navigate = useNavigate();

    const showTemporaryMessage = (msg, type = 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleLogin = async () => {
        if (!username || !password) return showTemporaryMessage('Please enter both username and password');

        try {
            // Here you would typically make an API call to authenticate
            // For this example, we'll simulate a successful login
            const loginSuccess = true; // Replace with actual authentication logic

            if (loginSuccess) {
                showTemporaryMessage('Login successful!', 'success');
                onLogin(username); // Notify parent component of successful login
                navigate('/'); // Redirect to main app or dashboard after login
            } else {
                showTemporaryMessage('Invalid username or password');
            }

           
        } catch (error) {
            showTemporaryMessage(Login failed: ${error.message});
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md border">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Client Login</h2>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="clientUsername" className="block text-gray-700 text-sm font-medium mb-1">Username</label>
                    <input
                        type="text"
                        id="clientUsername"
                        className="w-full px-4 py-2.5 border rounded-lg"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        pattern="[a-zA-Z0-9]+" // Alphanumeric characters only
                        title="Please enter alphanumeric characters only."
                    />
                </div>
                <div>
                    <label htmlFor="clientPassword" className="block text-gray-700 text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        id="clientPassword"
                        className="w-full px-4 py-2.5 border rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                    <img src={LogInIconURL} alt="Login" className="w-5 h-5" />
                    <span>Log In</span>
                </button>
            </div>
            <MessageBox message={message} type={messageType} />
        </div>
    );
};

export default ClientLoginPage;