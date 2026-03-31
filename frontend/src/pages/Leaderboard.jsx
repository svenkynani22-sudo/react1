import { Link } from 'react-router-dom';

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <nav className="mb-4">
        <Link to="/home" className="text-blue-400 mr-4">Home</Link>
        <Link to="/community" className="text-gray-400 mr-4">Community</Link>
      </nav>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p>Leaderboard coming soon...</p>
    </div>
  );
};

export default Leaderboard;