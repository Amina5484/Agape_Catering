// import express from 'express';
// import {
//   createBackup,
//   exportCollection,
//   createSystemBackup,
//   listBackups,
// } from '../controllers/backupController.js';
// import { protect, admin } from '../config/authMiddleware.js';

// const router = express.Router();

// // All backup routes require admin authentication
// router.use(protect, admin);

// // Create a database backup
// router.post('/create', createBackup);

// // Export specific collection data
// router.post('/export', exportCollection);

// // Create a full system backup
// router.post('/system', createSystemBackup);

// // List available backups
// router.get('/list', listBackups);

// export default router;
