import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import walletsRouter from "./wallets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(walletsRouter);

export default router;
