import { Router } from 'express';
import { protect } from '../middleware/authorized.middleware';
import { dataController } from '../controllers/data.controller';

const router: Router = Router();

// Export all user data (profile, reports, claims) as JSON
router.get('/export', protect, dataController.exportUserData);

export default router;
