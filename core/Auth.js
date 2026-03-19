import jwt from 'jsonwebtoken';
import { cookieTokenKey } from './controller/AdminController.js';
import Environment from './Environment.js';

export const authenticateFront= (req, res, next) => {
  const token = req.cookies[cookieTokenKey];

  try {
    if(token) {
        const decoded = jwt.verify(token, Environment.AUTH_SECRET_KEY);
        req.user = decoded;
        req.isAuthenticated = true;
    }
    next();    
  } catch (err) {
    res.clearCookie(cookieTokenKey);
    return res.status(400).json({ message: 'Token inválido.' });
  }
};

export const authenticateApi = (req, res, next) => {
  const token = req.cookies[cookieTokenKey];

  try {
    if(token) {
        const decoded = jwt.verify(token, Environment.AUTH_SECRET_KEY);
        req.user = decoded;
        req.isAuthenticated = true;
        next();
    } else {
      return res.status(401).json({ message: 'Não Autenticado' });
    }      
  } catch (err) {
    res.clearCookie(cookieTokenKey);
    return res.status(400).json({ message: 'Token inválido.' });
  }
};