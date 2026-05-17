import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import BackButton from '../components/BackButton.jsx';
import authAPI, { adminAPI } from '../services/api';

export default function Admin() {
  // Admin page ka main kaam: sirf admin user ko allow karna aur users list dikhana.
  // navigate ka use page change karne ke liye hota hai.
  const navigate = useNavigate();
  // users me backend se aane wali user list store hoti hai.
  const [users, setUsers] = useState([]);
  // loading true rahega jab tak data aa nahi jata.
  const [loading, setLoading] = useState(true);
  // agar API fail ho to error message yaha aata hai.
  const [error, setError] = useState();

  // currently login user ki info local storage se read hoti hai.
  const user = authAPI.getStoredUser();

  useEffect(() => {
    // useEffect: page load hote hi permission check + users fetch dono ka flow chalata hai.
    // Yeh check karta hai ki sirf admin hi yeh page dekh sake.
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    // adminAPI.getUsers function backend se saare users laata hai.
    adminAPI
      .getUsers()
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users', err);
        // Agar issue aaye to user-friendly error set karte hain.
        setError(err.message || 'Unable to load');
        setLoading(false);
      });
  }, [navigate, user]);

  return (
    <>
      <Navbar showAuthButtons={false} showProfileIcon={true} mode="dashboard" />
      <div className="mx-auto mt-4 max-w-7xl px-4 md:px-6">
        <BackButton />
      </div>
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {/* Is page me koi special JS animation nahi hai; simple data listing UI hai. */}
        {/* Loading state: jab tak list load ho rahi ho */}
        {loading && <p>Loading users...</p>}
        {/* Error state: agar data fetch fail ho */}
        {error && <p className="text-red-600">{error}</p>}
        {/* Data state: users list table me show hoti hai */}
        {!loading && !error && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {/* map function har user ko table ki ek row me convert karta hai */}
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 capitalize">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
