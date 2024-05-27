import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("Group description", (group) => {
  test.only("it should created a group", async (assert) => {
    const user = await UserFactory.create()
    const groupPayload = {
        name: 'test',
        description: 'test',
        schedule: 'test',
        location: 'test',
        chronic: 'test',
        master: user.id
    }

    const { body } = await supertest(BASE_URL).post("/groups").send(groupPayload).expect(201);
    assert.exists(body.group, "Group not created");
    assert.equal(body.group.name, groupPayload.name);
    assert.equal(body.group.description, groupPayload.description);
    assert.equal(body.group.schedule, groupPayload.schedule);
    assert.equal(body.group.location, groupPayload.location);
    assert.equal(body.group.chronic, groupPayload.chronic);
    assert.equal(body.group.master, groupPayload.master);

  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  });
});