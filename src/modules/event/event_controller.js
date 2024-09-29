import mongoose from "mongoose";
import Event from "../../../DB/Models/event_model.js";

// create events controller
export const createLimitEvent = async (req, res, next) => {
  // this should be from userlogin for create this event
  const { createdBy, rspRSVPed, date } = req.body;

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  // check valid date
  if (new Date(date) - today < 0)
    return next({
      message: "not Allowed this date because it is in past",
      cause: 404,
    });
  // count event created par day
  const eventCount = await Event.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    createdBy,
  });
  // check users to “RSVP” not repeated
  const duplicatesUser = rspRSVPed.filter((element, index, rspRSVPed) => {
    return rspRSVPed.indexOf(element) !== index;
  });
  // dupicate Users
  if (duplicatesUser.length > 0)
    return next({
      message: "You duplicateUser in your rspRSVPed List",
      cause: 404,
    });

  //check limit creation event
  if (eventCount >= 5)
    return next({
      message: "You cannot create more than 5 events per day",
      cause: 404,
    });

  // create new event
  const newEvent = await Event.create(req.body);
  if (!newEvent) next({ message: "failed  create New Event ", cause: 404 });

  return res.status(201).json({
    message: "Success create NewEvent",
    newEvent,
  });
};

/* 
- view Events
@ params createdBy
*/
export const veiwMyOwnEvents = async (req, res, next) => {
  const { createdBy } = req.query;

  const viewEvents = await Event.find({ createdBy });

  if (!createdBy || viewEvents.length == 0 || !viewEvents)
    return next({ message: "not Found Events " });
  return res.json({ viewEvents });
};

// Update Event

export const updateEventbyId = async (req, res, next) => {
  const { date } = req.body;
  const today = new Date();
  if (date)
    if (new Date(date) - today < 0)
      // check valid date
      return next({
        message: "not Allowed this date because it is in past",
        cause: 404,
      });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next({ message: "Id Event is not valid  ", cause: 404 });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    { _id: req.params.id, createdBy },
    req.body,
    {
      new: true,
    }
  );
  if (!updatedEvent)
    return next({
      message: "Event not found or you do not have permission to update it",
      cause: 404,
    });
  return res.status(200).json({
    message: "Updated Sucessfully ",
    updatedEvent,
  });
};

// delete Event By id
export const deleteEventById = async (req, res,next) => {
  const { createdBy } = req.query;
  console.log(req.params.id);
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next({ message: "Id Event is not valid  ", cause: 404 });
  }
  const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy });
  if (!event) {
    return res.status(404).json({
      message: "Event not found or you do not have permission to delete it",
    });
  }

  res.status(200).json({ message: "Event deleted successfully" });
};
