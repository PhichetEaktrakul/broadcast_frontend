import AppRoutes from "./routes";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
