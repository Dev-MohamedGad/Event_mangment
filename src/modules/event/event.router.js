import { Router } from "express";
import asyncHandler from "express-async-handler";

import * as eventcon from "./event_controller.js";
const eventRouter = Router();

//createRouter
eventRouter.post("/createLimitEvent", asyncHandler(eventcon.createLimitEvent));

// viewRouter

eventRouter.get("/all", asyncHandler(eventcon.veiwMyOwnEvents));

// updateEvents
eventRouter.put(
  "/updateEventbyId/:id",
  asyncHandler(eventcon.updateEventbyId)
);


//  delete Events by Idand createdby Username
eventRouter.delete('/deleteEventById/:id',asyncHandler(eventcon.deleteEventById))
export default eventRouter;
