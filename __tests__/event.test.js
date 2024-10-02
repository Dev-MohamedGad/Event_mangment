import supertest from "supertest";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Event from "../DB/Models/event_model.js";
import eventRouter from "../src/modules/event/event.router.js";
import { globalError } from "../src/middlewares/global-response.middleware.js";

const event = {
  createdBy: "user123",
  rspRSVPed: ["user1", "user2"],
  date: "2024-11-01T14:48:00.000Z",
  title: "Sample Event",
  description: "Description of the sample event",
};

const server = express();
server.use(express.json());
server.use("/events", eventRouter);
server.use(globalError);

describe("Event APIs", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Event.deleteMany({});
  });

  describe("GET /events/all", () => {
    it("should return all events created by a specific user", async () => {
      await Event.create(event);
      const res = await supertest(server).get("/events/all?createdBy=user123");
      expect(res.status).toBe(200);
      expect(res.body.viewEvents.length).toBe(1);
    });

    it("should return error when no events are found for a user", async () => {

      const res = await supertest(server).get("/events/all?createdBy=userNotFound");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("not Found Events ");
    });

    it("should return error when no createdBy parameter is provided", async () => {
      const res = await supertest(server).get("/events/all");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("not Found Events ");
    });
  });

  describe("POST /events/createLimitEvent", () => {
    it("should return an error for a past date", async () => {
      const res = await supertest(server)
        .post("/events/createLimitEvent")
        .send({
          createdBy: "user123",
          rspRSVPed: ["user1", "user2"],
          date: "2024-01-01T14:48:00.000Z",
          title: "Event in the past",
          description: "Description of the past event",
        });
      expect(res.body.message).toBe("not Allowed this date because it is in past");
      expect(res.status).toBe(404);
    });

    it("should return an error for duplicate RSVP users", async () => {
      const res = await supertest(server)
        .post("/events/createLimitEvent")
        .send({
          createdBy: "user123",
          rspRSVPed: ["user1", "user1", "user2"],
          date: "2024-11-10T14:48:00.000Z",
          title: "Duplicate RSVP Event",
          description: "Event with duplicate RSVPs",
        });
      expect(res.body.message).toBe("You duplicateUser in your rspRSVPed List");
      expect(res.status).toBe(404);
    });

    it("should return an error if more than 5 events are created in a day", async () => {
      for (let i = 0; i < 5; i++) {
        await Event.create({ ...event, date: `2024-11-01T14:48:00.000Z` });
      }
      const res = await supertest(server)
        .post("/events/createLimitEvent")
        .send(event);
      expect(res.body.message).toBe("You cannot create more than 5 events per day");
      expect(res.status).toBe(404);
    });

    it("should successfully create a new event", async () => {
      const res = await supertest(server)
        .post("/events/createLimitEvent")
        .send(event);
      expect(res.status).toBe(201);
      expect(res.body.newEvent.title).toBe("Sample Event");
    });
  });

  describe("PUT /events/updateEventbyId/:id", () => {
    it("should return an error for updating with a past date", async () => {
      const createdEvent = await Event.create(event);
      const res = await supertest(server)
        .put(`/events/updateEventbyId/${createdEvent._id}`)
        .send({
          date: "2024-01-01T14:48:00.000Z",
        });
      expect(res.body.message).toBe("not Allowed this date because it is in past");
      expect(res.status).toBe(404);
    });

    it("should return an error for invalid event ID", async () => {
      const res = await supertest(server)
        .put("/events/updateEventbyId/invalidID")
        .send({
          title: "Updated Title",
        });
      expect(res.body.message).toBe("Id Event is not valid  ");
      expect(res.status).toBe(404);
    });

    it("should update an event successfully", async () => {
      const createdEvent = await Event.create(event);
      const res = await supertest(server)
        .put(`/events/updateEventbyId/${createdEvent._id}`)
        .send({
          title: "Updated Event Title",
        });
      expect(res.status).toBe(201);
      expect(res.body.updatedEvent.title).toBe("Updated Event Title");
    });
  });

  describe("DELETE /events/deleteEventById/:id", () => {
    it("should return an error for invalid event ID", async () => {
      const res = await supertest(server).delete("/events/deleteEventById/invalidID");
      expect(res.body.message).toBe("Id Event is not valid  ");
      expect(res.status).toBe(404);
    });

    it("should return an error if the event does not exist", async () => {
      const res = await supertest(server)
        .delete("/events/deleteEventById/64feba94531e2fc7d89b1e21")
        .query({ createdBy: "user123" });
      expect(res.body.message).toBe("Event not found or you do not have permission to delete it");
      expect(res.status).toBe(404);
    });

    it("should delete the event successfully", async () => {
      const createdEvent = await Event.create(event);
      const res = await supertest(server)
        .delete(`/events/deleteEventById/${createdEvent._id}`)
        .query({ createdBy: "user123" });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event deleted successfully");
    });
  });
});
