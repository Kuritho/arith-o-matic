const express = require("express");
const SerialPort = require("serialport");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const port = new SerialPort.SerialPort({
  path: "COM6", 
  baudRate: 115200,
});

app.post("/dispense", (req, res) => {
  port.write("dispense\n", (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to dispense", error: err });
    }
    res.json({ message: "Dispensing..." });
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

//for run: node server.js
