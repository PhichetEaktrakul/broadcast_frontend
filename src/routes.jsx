import { Route, Routes } from "react-router";
import BoardcastPrice from "./pages/BoardcastPrice";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<BoardcastPrice />} />
    </Routes>
  );
};

export default AppRoutes;
