import { useEffect, useState } from "react";
import { Home, MessageSquare, Workflow } from "lucide-react";
import Sidebar, { SidebarItem } from "./app-sidebar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

interface Recommendation {
  recommendation_id: number;
  name: string;
  created_at: string;
}

const OptionSidebar = () => {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:5000/api/career-recommendations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await res.json();
        setRecs(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("No Firebase user logged in");
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);

  return (
    <div>
      <Sidebar>
        <Link to="/" ><SidebarItem icon={<Home size={20} />} text="Home" active /></Link>
        <SidebarItem icon={<Workflow size={20} />} text="Career Recommendation" />
        

        {/* Loading state */}
        {loading && <p className="px-2 text-xs text-gray-400">Loading...</p>}

        {/* Recommendations list */}
        {!loading &&
          recs.map((rec) => {
            const date = new Date(rec.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <SidebarItem
                key={rec.recommendation_id}
                icon={<MessageSquare size={20} />}
                text={`${rec.name} — ${date}`}
                active={false}
              />
            );
          })}

        {/* Empty state */}
        {!loading && recs.length === 0 && (
          <p className="px-2 text-xs text-gray-400"></p>
        )}
      </Sidebar>
    </div>
  );
};

export default OptionSidebar;
