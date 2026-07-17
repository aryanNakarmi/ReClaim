import express, { Router } from 'express';
import { uploadImage } from '../middleware/multer.middleware';
import { adminMiddleware, protect } from '../middleware/authorized.middleware';
import { FoundItemController } from '../controllers/founditem.controller';

const router: Router = express.Router();
const controller = new FoundItemController();

// Public routes
router.get('/', controller.getAllPosts);
router.get('/category/:category', controller.getPostsByCategory);
router.get('/my-claims', protect, controller.getMyClaims);
router.get('/:id', controller.getPostById);
 
// Admin routes
router.post('/', protect, adminMiddleware, uploadImage.array('foundItem', 5), controller.createPost);
router.put('/:id', protect, adminMiddleware, uploadImage.array('foundItem', 5), controller.updatePost);
router.put('/:id/status', protect, adminMiddleware, controller.updatePostStatus);
router.delete('/:id', protect, adminMiddleware, controller.deletePost);

// User: send claim request
router.post('/:id/request-claim', protect, controller.requestClaim);

// User: cancel claim request
router.delete('/:id/request-claim', protect, controller.cancelClaimRequest);

// Admin: view all claimers for an item
router.get('/:id/claim-requests', protect, adminMiddleware, controller.getClaimRequests);

export default router;
