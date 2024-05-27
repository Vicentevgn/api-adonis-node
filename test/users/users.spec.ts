import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";
import Hash from "@ioc:Adonis/Core/Hash";
import User from "App/Models/User";

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`;
let token = '';
let authenticatedUser = {} as User;

test.group("Users", (group) => {
  test("it should create an user", async (assert) => {
    const userPayload = {
      email: "teste@gmail.com",
      username: "test",
      password: "123456",
      avatar: "https://images.com.br/avatar.png",
    };

    const { body } = await supertest(BASE_URL)
      .post("/users")
      .send(userPayload)
      .expect(201);
    assert.exists(body.user, "User not created");
    assert.exists(body.user.id, "Id undefined");
    assert.equal(body.user.email, userPayload.email);
    assert.equal(body.user.username, userPayload.username);
    assert.equal(body.user.avatar, userPayload.avatar);
    assert.notExists(body.user.password, userPayload.password);
  });

  test("it should return 409 when email is already in use", async (assert) => {
    const { email } = await UserFactory.create();
    const { body } = await supertest(BASE_URL)
      .post("/users")
      .send({
        email,
        username: "test",
        password: "123456",
      })
      .expect(409);
  });

  test("it should return 409 when username is already in use", async (assert) => {
    const { username } = await UserFactory.create();
    const { body } = await supertest(BASE_URL)
      .post("/users")
      .send({
        email: "teste@teste.com",
        username,
        password: "123456",
      })
      .expect(409);

    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, "409");
  });

  test("it should 422 when required data is not provided", async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post("/users")
      .send({})
      .expect(422);
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, '422')
  });

  test("it should update an user", async (assert) => {
    const email = "test@test.com";
    const avatar = "https://images.com.br/avatar.png";

    const { body } = await supertest(BASE_URL)
      .put(`/users/${authenticatedUser.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ email, avatar, password: authenticatedUser.password })
      .expect(200);

    assert.exists(body.user, "User undefined");
    console.log(body); 
  });

  test("it should update user password", async (assert) => {
    const password = "test123"

    const { body } = await supertest(BASE_URL)
    .put(`/users/${authenticatedUser.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ 
        email: authenticatedUser.email, 
        avatar: authenticatedUser.avatar,
        password,
    })
    .expect(200)

    assert.exists(body.user, "User undefined")
    assert.equal(body.user.id, authenticatedUser.id)

    await authenticatedUser.refresh()
    assert.isTrue(await Hash.verify(authenticatedUser.password, password))

  })

  test("it should return 422 when required data is not provided", async (assert) => {
    const { id } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
    .put(`/users/${id}`).set("Authorization", `Bearer ${token}`).send({}).expect(422)

    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, '422')
  })

  group.before(async () => {
    const plainPassword = "test123";
    const user = await UserFactory.merge({ password: plainPassword }).create();

    const { body } = await supertest(BASE_URL)
      .post("/register")
      .send({
        email: user.email,
        password: plainPassword,
      })
      .expect(201);

    token = body.token.token;
    authenticatedUser = user;
  });

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
