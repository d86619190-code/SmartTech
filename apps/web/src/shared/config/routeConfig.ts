import React from 'react';
import LoginPage from '../../pages/Login';
import { HomePage } from '../../pages/Home';

export const routes = [
  { path: '/', element: React.createElement(HomePage) },
  { path: '/login', element: React.createElement(LoginPage) },
];
