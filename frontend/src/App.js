import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Login";
import Registration from "./Registration";
import ViewFiles from "./ViewFiles";
import AdminView from "./AdminView";
import Uploads from "./Uploads";

function App() {
  const [currentUser, setCurrentuser] = useState(null);
  useEffect(() => {
    setCurrentuser(window.sessionStorage.getItem("currentUser"));
  }, []);

  return (
    <BrowserRouter>
      <div classname="App">
        <Routes>
          <Route
            path="/login"
            element={<Login onLoggedIn={(user) => setCurrentuser(user)} />}
          />
          <Route path="/register" element={<Registration />} />
          <Route
            path="/view"
            element={<ViewFiles currentUser={currentUser} />}
          />
          <Route
            path="/uploads"
            element={<Uploads currentUser={currentUser} />}
          />
          <Route
            path="/admin_view"
            element={<AdminView currentUser={currentUser} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
