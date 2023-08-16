import { Entry } from "@prisma/client";
import Prisma from "../src/db";
import { server } from "../src/server";

const sampleEntry: Entry = {
  id: "sampleid1",
  title: "foo",
  description: "bar",
  scheduled: new Date("2023-08-17T17:36:43.069Z"),
  created_at: new Date("2023-08-16T17:36:43.069Z"),
};

beforeEach(async () => {
  await Prisma.entry.deleteMany({});
  await Prisma.entry.create({ data: sampleEntry });
});

describe("server test", () => {
  it("can get all entries", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/get/",
    });

    const parsedResponse: Entry[] = await response.json();

    expect(response.statusCode).toEqual(200);
    expect(parsedResponse.length).toEqual(1);
  });

  it("can get by id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/get/" + sampleEntry.id,
    });

    const parsedResponse: Entry = await response.json();

    expect(response.statusCode).toEqual(200);
    expect(parsedResponse.id).toEqual(sampleEntry.id);
    expect(parsedResponse.description).toEqual(sampleEntry.description);
  });

  it("doesn't get unknown id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/get/fakeid",
    });

    expect(response.statusCode).toEqual(500);
  });

  it("can create a new entry", async () => {
    const newEntry: Entry = {
      id: "sampleid3",
      title: "My Note",
      description: "Buy milk",
      scheduled: new Date("2023-11-11T17:36:43.069Z"),
      created_at: new Date("2023-08-16T19:36:43.069Z"),
    };

    const response = await server.inject({
      method: "POST",
      url: "/create/",
      payload: newEntry,
    });

    expect(response.statusCode).toEqual(200);

    const checkPresent = await server.inject({
      method: "GET",
      url: "/get/" + newEntry.id,
    });

    expect(response.statusCode).toEqual(200);
  });

  it("can't create an invalid entry", async () => {
    const invalidEntry = {
      id: "sampleid4",
      title: "My Note 2",
      scheduled: new Date("2023-30-16T19:36:43.069Z"),
      created_at: new Date("2023-08-16T19:36:43.069Z"),
    };


    const response = await server.inject({
      method: "POST",
      url: "/create/",
      payload: invalidEntry,
    });

    console.log(response.statusMessage)
    expect(response.statusCode).toEqual(500);
  });

  it("can delete an entry", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/delete/" + sampleEntry.id,
    });

    expect(response.statusCode).toEqual(200);

    const notPresent = await server.inject({
      method: "GET",
      url: "/get/",
    });

    const parsedNotPresent: Entry[] = await notPresent.json();

    expect(response.statusCode).toEqual(200);
    expect(parsedNotPresent.length).toEqual(0);
  });

  it("can update", async () => {
    const newDesc = "New description";

    const response = await server.inject({
      method: "PUT",
      url: "/update/" + sampleEntry.id,
      payload: { ...sampleEntry, description: newDesc },
    });

    const parsedResponse: Entry = await response.json();

    expect(response.statusCode).toEqual(200);

    const changedEntry = await server.inject({
      method: "GET",
      url: "/get/" + sampleEntry.id,
    });

    const parsedChangedEntry: Entry = await changedEntry.json();

    expect(changedEntry.statusCode).toEqual(200);

    expect(parsedChangedEntry.description).toEqual(newDesc);
  });
});
