import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "@/pages/login";
import Register from "@/pages/register";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<Login />} path="/login" />
        <Route element={<Register />} path="/register" />
      </Routes>
    </AuthProvider>
  );
}

export default App;
