import { server } from "../src/server"
import { Entry } from "@prisma/client";
import Prisma from "../src/db";

beforeEach(async () => {

  const sampleEntry : Entry = {
    id : "sampleid1",
    title : "foo",
    description : "bar",
    scheduled : new Date("2023-08-17T17:36:43.069Z"),
    created_at : new Date("2023-08-16T17:36:43.069Z")
  }

  await Prisma.entry.deleteMany({});
  await Prisma.entry.create({data: sampleEntry});


})

describe("server test", () => {
  it("can get rows", async () => {

    const response = await server.inject({
      method: 'GET',
      url: '/get/'
    })

    const parsedResponse = await response.json()

    expect(response.statusCode).toEqual(200)
    expect(parsedResponse.length).toEqual(1)
  });
});