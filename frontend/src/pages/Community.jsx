import { Link } from 'react-router-dom';

const Community = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <nav className="mb-4">
        <Link to="/home" className="text-blue-400 mr-4">Home</Link>
        <Link to="/leaderboard" className="text-gray-400">Leaderboard</Link>
      </nav>
      <h1 className="text-2xl font-bold">Community Doubts</h1>
      <p>Community section coming soon...</p>
    </div>
  );
};

export default Community;