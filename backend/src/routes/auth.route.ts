import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware, protect } from "../middleware/authorized.middleware";
import uploadImage from "../middleware/multer.middleware";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authLimiter, authController.register)
router.post("/login", authLimiter, authController.login)
router.post("/request-password-reset", passwordResetLimiter, authController.requestPasswordReset)
router.put(
  "/update-profile", 
  authorizedMiddleware,
  uploadImage.single("profilePicture"),
  authController.updateProfile,
);

//user routes


router.get("/:id",protect,authController.getUserById.bind(authController))
router.delete("/:id",protect,authController.deleteUser)
router.post("/reset-password/:token", authController.resetPassword);

export default router;