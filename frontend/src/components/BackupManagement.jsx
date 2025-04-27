import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

// Configure axios with base URL
const API_BASE_URL = 'http://localhost:4000';
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const BackupManagement = () => {
  const [backups, setBackups] = useState({ daily: [], weekly: [] });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('json');

  const collections = [
    'users',
    'orders',
    'menus',
    'categories',
    'feedback',
    'carts',
  ];

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/backup/list');
      setBackups(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch backups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      await api.post('/api/backup/create');
      showSnackbar('Backup created successfully', 'success');
      fetchBackups();
    } catch (error) {
      showSnackbar('Failed to create backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSystemBackup = async () => {
    try {
      setLoading(true);
      await api.post('/api/backup/system');
      showSnackbar('System backup created successfully', 'success');
      fetchBackups();
    } catch (error) {
      showSnackbar('Failed to create system backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!selectedCollection) {
      showSnackbar('Please select a collection to export', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        '/api/backup/export',
        {
          collectionName: selectedCollection,
          format: selectedFormat,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${selectedCollection}-${new Date().toISOString()}.${selectedFormat}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSnackbar('Export completed successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to export data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        p: 3,
        ml: { xs: 0, md: '256px' },
        mt: '64px',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Backup Management
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBackup}
            disabled={loading}
          >
            Create Database Backup
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCreateSystemBackup}
            disabled={loading}
          >
            Create System Backup
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Export Data
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Collection</InputLabel>
              <Select
                value={selectedCollection}
                label="Collection"
                onChange={(e) => setSelectedCollection(e.target.value)}
              >
                {collections.map((collection) => (
                  <MenuItem key={collection} value={collection}>
                    {collection.charAt(0).toUpperCase() + collection.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Format</InputLabel>
              <Select
                value={selectedFormat}
                label="Format"
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleExportData}
              disabled={loading || !selectedCollection}
            >
              Export
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Daily Backups
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Backup File</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.daily.map((backup) => (
                  <TableRow key={backup}>
                    <TableCell>{backup}</TableCell>
                    <TableCell>
                      {new Date(backup.split('-')[1]).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Weekly System Backups
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Backup File</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.weekly.map((backup) => (
                  <TableRow key={backup}>
                    <TableCell>{backup}</TableCell>
                    <TableCell>
                      {new Date(backup.split('-')[2]).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BackupManagement;
