import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Login from './components/Login';
import Header from './components/common/Header';
import RecipesList from './components/Recipes/RecipesList';
import RecipeDetail from './components/Recipes/RecipeDetail';
import AddRecipe from './components/Recipes/AddRecipe';
import Fridge from './components/Fridge/Fridge';
import Calender from './components/Calender/Calendar';
import Feedback from './components/Feedback/Feedback';
import Footer from './components/common/Footer';
import Home from './components/Home/Home';
import EditRecipe from "./components/Recipes/EditRecipe";
import Register from "./components/Register";




function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<RecipesList />} />
        <Route path="/recipes/add" element={<AddRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/edit" element={<EditRecipe />} />
        <Route path="/fridge" element={<Fridge />} />
        <Route path="/calendar" element={<Calender />} />
        <Route path="/Feedback" element={<Feedback />} />
        <Route path='/login' element={<Login />} />
        <Route path="/register" element={<Register />} />

        
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
