import React from 'react';

const ContactUsButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full mt-4 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      Contact Us
    </button>
  );
};

export default ContactUsButton;