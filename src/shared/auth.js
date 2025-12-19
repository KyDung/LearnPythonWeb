const STORAGE_KEY = "pylearn-user";

export const getUser = () => localStorage.getItem(STORAGE_KEY);

export const setUser = (username) => {
  localStorage.setItem(STORAGE_KEY, username);
};

export const clearUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const applyAuthUI = () => {
  const user = getUser();
  document.querySelectorAll("[data-auth='user']").forEach((el) => {
    el.hidden = !user;
  });
  document.querySelectorAll("[data-auth='guest']").forEach((el) => {
    el.hidden = !!user;
  });
  const nameBadge = document.querySelector("#user-badge");
  if (nameBadge) {
    nameBadge.textContent = user ? `Xin chào, ${user}` : "";
    nameBadge.hidden = !user;
  }
  const logoutBtn = document.querySelector("#logout-link");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearUser();
      window.location.href = "index.html";
    });
  }
};
