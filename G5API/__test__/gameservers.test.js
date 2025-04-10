import { agent } from "supertest";
import app from "../app.js";
const request = agent(app);
const password = "SUPER SECRET DON'T TELL";

describe("Test the game server routes.", () => {
  beforeAll(() => {
    return request.get("/auth/steam/return")
      .expect(302);
  });
  it("Should return all servers depending on permission of user.", () => {
    return request
      .get("/servers")
      .expect("Content-Type", /json/)
      .expect(200);
  });
  it("Should setup a new server with the given values.", () => {
    let newServerData = [
      {
        ip_string: "192.168.0.1",
        port: 27015,
        display_name: "Phlex's Temp Server",
        rcon_password: password,
        public_server: 1,
      },
    ];
    return request
      .post("/servers/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(newServerData)
      .expect((result) => {
        expect(result.body.message).toMatch(/successfully/);
      })
      .expect(200);
  });
  it("Should setup a new server with the given values.", () => {
    let newServerData = [
      {
        ip_string: "192.168.0.1",
        port: 27016,
        display_name: "Phlex's Temp Server #2",
        rcon_password: password,
        public_server: 1,
      },
    ];
    return request
      .post("/servers/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(newServerData)
      .expect(200)
      .expect((result) => {
        expect(result.body.message).toMatch(/successfully/);
      });
  });
  it("Should setup a new server so we can play with it later.", () => {
    let newServerData = [
      {
        ip_string: "192.168.0.1",
        port: 27020,
        display_name: "Phlex's Not So Temp Server",
        rcon_password: password,
        public_server: 1,
      },
    ];
    return request
      .post("/servers/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(newServerData)
      .expect(200)
      .expect((result) => {
        expect(result.body.message).toMatch(/successfully/);
      });
  });
  it("Request the information of the inserted server.", () => {
    return request
      .get("/servers/1")
      .expect("Content-Type", /json/)
      .expect(200)
      // Test to decrypt the password, if it matches then we decrypt/encrypt properly!
      .expect((result) => {
        expect(result.body.server.rcon_password).toBe(password);
      });
  });
  it("Request the information of all users servers.", () => {
    return request
      .get("/servers/myservers")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((result) => {
        expect(result.body.servers.length).toBeGreaterThanOrEqual(1);
      });
  });
  it("Should transfer ownership to the second user.", () => {
    let updatedServerData = [
      {
        display_name: "Phlex's Temp Server #2 EDITED",
        user_id: 2,
        server_id: 2,
      },
    ];
    return request
      .put("/servers/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(updatedServerData)
      .expect(200)
      .expect((result) => {
        expect(result.body.message).toMatch(/successfully/);
      });
  });
  it("Should delete the information of the first server.", () => {
    let deleteData = [{ server_id: 1 }];
    return request
      .delete("/servers/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(deleteData)
      .expect((result) => {
        expect(result.body.message).toMatch(/successfully/);
      })
      .expect(200);
  });
  it("Request the information of the second server, now no longer owned by us.", () => {
    return request
      .get("/servers/2")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((result) => {
        expect(result.body.rcon_password).toEqual(undefined);
      });
  });
  it("Should try and fail to edit server 2.", () => {
    let updatedServerData = [
      {
        display_name: "Phlex's Temp Server #2 EDITED BAD ACT0R",
        user_id: 1,
        server_id: 2,
      },
    ];
    return request
      .put("/servers/")
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(updatedServerData)
      .expect(403)
      .expect((result) => {
        expect(result.body.message).toMatch(/not authorized/);
      });
  });
});