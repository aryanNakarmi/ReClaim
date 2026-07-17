import express, { Router } from 'express';
import { LostItemController } from '../controllers/lostitem.controller';
import { uploadImage } from '../middleware/multer.middleware';
import { adminMiddleware, protect } from '../middleware/authorized.middleware';

const router: Router = express.Router();
const controller = new LostItemController();

//loggedin users can upload a report photo
router.post(
  '/upload-photo',
  protect,
  uploadImage.single('lostItem'),
  controller.uploadReportPhoto
);
 
router.get('/all', protect, adminMiddleware, controller.getAllReports);
router.get('/my-reports', protect, controller.getMyReports);
router.post('/', protect, controller.createReport);
router.get('/:id', protect, controller.getReportById);
router.put('/:id/status', protect, adminMiddleware, controller.updateReportStatus);
router.delete('/:id', protect, controller.deleteReport);
router.get('/category/:category', protect, controller.getReportsByCategory);

export default router;
