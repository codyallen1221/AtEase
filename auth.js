let currentUser = null;

async function signInWithGoogle() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) {
    showAuthError(error.message);
  }
}

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error("Sign out failed:", error);
  }
}

function showAuthError(message) {
  const errorEl = document.getElementById("auth-error");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function showAuthScreen() {
  document.getElementById("auth-screen").hidden = false;
  document.getElementById("app").hidden = true;
}

function showApp() {
  document.getElementById("auth-screen").hidden = true;
  document.getElementById("app").hidden = false;
}

async function handleSignedIn(user) {
  currentUser = user;
  document.getElementById("user-email").textContent = user.email;
  showApp();

  await loadUserData();
}

function handleSignedOut() {
  currentUser = null;
  clearUserData();
  showAuthScreen();
}

document.addEventListener("DOMContentLoaded", async function() {
  document.getElementById("google-signin-btn").addEventListener("click", signInWithGoogle);
  document.getElementById("signout-btn").addEventListener("click", signOut);

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user) {
    await handleSignedIn(session.user);
  } else {
    showAuthScreen();
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      if (currentUser?.id !== session.user.id) {
        await handleSignedIn(session.user);
      }
    } else if (event === "SIGNED_OUT") {
      handleSignedOut();
    }
  });
});
