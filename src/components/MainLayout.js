import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './common/Header.js';
import Footer from './common/Footer.js';
import './MainLayout.scss';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="content-wrapper">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;