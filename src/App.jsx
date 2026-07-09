import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import ProducerDashboard from "./pages/ProducerDashboard";
import VetDashboard from "./pages/VetDashboard";

import { onAuthChange, signOutUser } from "./services/supabaseAuth";
import { getProfileById } from "./services/profile";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

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

    // volta para landing ao sair
    setShowAuth(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <p className="text-lg text-zinc-600">Carregando...</p>
      </div>
    );
  }

  // Usuário não autenticado
  if (!authUser || !userData) {
    if (!showAuth) {
      return (
        <LandingPage
          onStart={() => setShowAuth(true)}
        />
      );
    }

    return <AuthPage />;
  }

  // Dashboard produtor
  if (userData.role === "produtor") {
    return (
      <ProducerDashboard
        userData={userData}
        onLogout={handleLogout}
      />
    );
  }

  // Dashboard veterinário
  if (userData.role === "veterinario") {
    return (
      <VetDashboard
        userData={userData}
        authUser={authUser}
        onLogout={handleLogout}
      />
    );
  }

  // fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100">
      <p className="text-lg text-red-600">
        Tipo de usuário inválido: {String(userData.role)}
      </p>
    </div>
  );
}

export default App;
