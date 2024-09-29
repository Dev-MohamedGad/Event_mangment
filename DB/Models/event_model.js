

import { model, Schema } from "mongoose";

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  rspRSVPed: {
    type: [String], 
   
  },
},{timestamps:true});

const Event =model('Event', eventSchema);

export default Event;