import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { Send, Image, Plus, LogOut, User } from 'lucide-react';

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await api.get('/assistant/history');
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() && !image) return;

    const newMessage = { role: 'user', content: input, image };
    setMessages([...messages, newMessage]);
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('question', input);
      if (image) formData.append('image', image);

      const res = await api.post(
        image ? '/assistant/upload-image' : '/assistant/chat',
        image ? formData : { question: input }
      );

      const aiMessage = { role: 'assistant', content: res.data.answer };
      setMessages(prev => [...prev, aiMessage]);
      fetchChats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col">
        <button className="flex items-center mb-4 p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
          <Plus className="mr-2" size={20} />
          New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
              {chat.question.substring(0, 30)}...
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <User className="mr-2" size={20} />
            {user?.name}
          </div>
          <button onClick={handleLogout} className="flex items-center w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">
            <LogOut className="mr-2" size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-gray-800 p-4">
          <div className="flex space-x-4">
            <Link to="/home" className="text-blue-400">Home</Link>
            <Link to="/community" className="text-gray-400 hover:text-white">Community</Link>
            <Link to="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link>
          </div>
        </nav>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">How can MentorMind help you today?</h1>
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  <div className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    Explain a math problem
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    Help with coding
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    Study tips
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                    General questions
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                  }`}>
                    {msg.image && <img src={URL.createObjectURL(msg.image)} alt="Uploaded" className="mb-2 max-w-full" />}
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 px-4 py-2 rounded-lg">
                    MentorMind is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask MentorMind anything..."
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="cursor-pointer">
              <Image size={24} className="text-gray-400 hover:text-white" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button onClick={handleSend} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
              <Send size={20} />
            </button>
          </div>
          {image && (
            <div className="mt-2">
              <img src={URL.createObjectURL(image)} alt="Preview" className="max-w-xs rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;