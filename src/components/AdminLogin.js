import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


//login id and password
const ADMIN_EMAIL = 'admin@novadelight.com';
const ADMIN_PASSWORD = '$Nova@Delight18';

const AdminLogin = ({ setIsAdmin, setAdminRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  // Check if admin is already logged in via localStorage
  useEffect(() => {
    const rememberedAdmin = localStorage.getItem('rememberedAdmin') === 'true';
    const adminId = localStorage.getItem('adminId');

    if (rememberedAdmin && adminId) {
      console.log('Admin already logged in from localStorage');
      setIsAdmin(true);
      navigate('/admin/dashboard');
    }
  }, [navigate, setIsAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Set persistence if remember me is checked
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      }

      // Try to authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Retrieve admin role from Firestore
      let adminRole = 'admin'; // Default to admin
      try {
        const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
        if (adminDoc.exists()) {
          adminRole = adminDoc.data().role || 'admin';
        }
      } catch (firestoreError) {
        console.log('Could not retrieve role from Firestore, defaulting to admin');
      }

      // Save admin data in localStorage
      localStorage.setItem('rememberedAdmin', rememberMe ? 'true' : 'false');
      localStorage.setItem('adminId', userCredential.user.uid);
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminRole', adminRole); // Store the role
      localStorage.setItem('adminLoginTime', new Date().toISOString());

      setIsAdmin(true);
      if (setAdminRole) setAdminRole(adminRole); // Update app state
      navigate('/admin/dashboard');
    } catch (error) {
      // If Firebase auth fails, try the default hardcoded credentials as fallback
      const storedPassword = localStorage.getItem('adminPassword');
      const currentAdminPassword = storedPassword || ADMIN_PASSWORD;

      if (email === ADMIN_EMAIL && password === currentAdminPassword) {
        // Default admin login (fallback)
        localStorage.setItem('rememberedAdmin', rememberMe ? 'true' : 'false');
        localStorage.setItem('adminId', 'admin-default');
        localStorage.setItem('adminEmail', ADMIN_EMAIL);
        localStorage.setItem('adminRole', 'admin'); // Default admin has full permissions
        localStorage.setItem('adminLoginTime', new Date().toISOString());

        setIsAdmin(true);
        if (setAdminRole) setAdminRole('admin'); // Update app state
        navigate('/admin/dashboard');
      } else {
        // Show appropriate error message
        if (error.code === 'auth/user-not-found') {
          setError('No admin account found with this email.');
        } else if (error.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else if (error.code === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else if (error.code === 'auth/too-many-requests') {
          setError('Too many failed login attempts. Please try again later.');
        } else {
          setError('Invalid admin credentials. Access denied.');
        }
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ width: '100%', px: { xs: 0, sm: 3, md: 4 } }}>
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h4" align="center" gutterBottom>
            Admin Login
          </Typography>
          {error && (
            <Typography color="error" align="center" gutterBottom>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
              sx={{ mt: 1 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 35%, #64b5f6 100%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 35%, #2196f3 100%)',
                  boxShadow: '0 4px 8px 2px rgba(33, 150, 243, .4)'
                }

              }}
            >
              {/* xyz */}
              Login
            </Button>
            {/* <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => navigate('/admin/register')}
            >
              Register as Admin
            </Button>*/}
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
