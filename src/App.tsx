import "./index.css";
import Phone from "./system/Phone";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// The whole site is the phone; which app is open is decided by the URL (/exec, /about, …) inside it.
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Phone />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
