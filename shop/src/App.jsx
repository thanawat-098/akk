import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Login/Login";
import Register from "./Register/Register";
import Shop from "./Shop/Shop";
import AddProduct from "./AddProduct/AddProduct";
import ProductList from "./AddProduct/ProductList";
import Order from "./Shop/Order";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route path="/shop" element={<Shop></Shop>}></Route>
        <Route path="/up" element={<AddProduct />}></Route>
        <Route path="/pr" element={<ProductList />}></Route>
        <Route path="/or" element={<Order />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
