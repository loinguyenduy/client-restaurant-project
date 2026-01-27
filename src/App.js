import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout.js';
import HomePage from './components/home/HomePage.js';
import './index.scss';
import Menu from './components/menu/Menu.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path='/menu' element={<Menu/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;