const net = require("net");
const fs = require("fs");
const deviceInfoStr = fs.readFileSync("./device-info.txt", {
  encoding: "utf8",
  flag: "r",
});

var client = net.connect({ port: 9091 }, function () {
  log.info("connected to server!");
  client.write(deviceInfoStr);
});
client.on("data", function (data) {
  deviceInfoStr = data.toString();
  client.end();
  resolve(deviceInfoStr);
});
