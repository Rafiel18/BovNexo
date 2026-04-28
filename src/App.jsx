import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import ProducerDashboard from "./pages/ProducerDashboard";
import VetDashboard from "./pages/VetDashboard";
import { onAuthChange, signOutUser } from "./services/supabaseAuth";
import { getProfileById } from "./services/profile";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (!user) {
        setAuthUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        setAuthUser(user);
        const profile = await getProfileById(user.id);
        setUserData(profile);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    await signOutUser();
    setAuthUser(null);
    setUserData(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <p className="text-lg text-zinc-600">Carregando...</p>
      </div>
    );
  }

  if (!authUser || !userData) {
    return <AuthPage />;
  }

  if (userData.role === "produtor") {
    return <ProducerDashboard userData={userData} onLogout={handleLogout} />;
  }

  if (userData.role === "veterinario") {
    return (
     <VetDashboard
  userData={userData}
  authUser={authUser}
  onLogout={handleLogout}
/>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
      <p className="text-lg text-red-600">
        Tipo de usuário inválido: {String(userData.role)}
      </p>
    </div>
  );
}

export default App;