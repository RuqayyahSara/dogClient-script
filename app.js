const os = require("os");
const { io } = require("socket.io-client");
const { setTimeout } = require("timers/promises");
const readlineSync = require('readline-sync');
const axios = require("axios");

async function generate() {
  console.clear()
  console.log("------------------------------------------------------------")
  console.log("\t CLIENT AUTHENTICATION TOKEN GENERATION")
  console.log("------------------------------------------------------------")

  let client = ["dog", "ui"]
  let data = {}
  console.log("Select Your Client Type from the given options below : ")
  client.forEach((e, i) => {
    console.log(`${i + 1}. ${e}`)
  })
  data.clientType = client[readlineSync.questionInt() - 1]
  while (!data.clientType)
    data.clientType = client[readlineSync.questionInt("Invalid Option. Choose again : ") - 1]

  data.macA = readlineSync.question("Enter your MAC Address: ")
  while (!data.macA)
    data.macA = readlineSync.questionInt("Invalid Option. Enter again : ")

  console.log("Generating Token .... ")
  token = await getToken()

  async function getToken() {
    try {
      let res = await axios.post("http://34.130.85.166:8000/genTok", data)
      console.log("\nToken generated successfully!\n")
      return res.data
    } catch (err) {
      console.log(err)
    }
  }

}
generate()


let token;
let macA;
const nI = os.networkInterfaces();
for (let key in nI) {
  if (!nI[key][0].internal) {
    macA = nI[key][0].mac;
    break;
  }
}
const socket = io("http://34.130.85.166:8000/");

socket.on("connect", async () => {
  console.log("I am connected to the socket server worker thread... Yayyyy!!");


  //Client Auth
  socket.emit("clientAuth", token);


  socket.emit("initPerfData", await initPerfData());

  let perfDataInterval = setInterval(async () => {
    socket.emit("perfData", await performanceData());
    console.log("doing.....");
  }, 1000);

  socket.on('error', (error) => {
    console.log(error);
  });

  socket.on("disconnect", () => {
    clearInterval(perfDataInterval);
  });

});


/*
    Performace Monitoring Metrics : 
        Live CPU Load (Current)
        Memory Usage
            - Free Memory
            - Total Memory
        OS Type : Mac (Darwin) , Windows, Linux
        UpTime
        CPU Arch Info : Type Of Arch,  Number of Cores , Clock Speed
*/


async function initPerfData() {
  const data = await performanceData();
  data.macA = macA;
  return data;
}

async function performanceData() {
  const cpus = os.cpus();
  const osType = os.type() == "Darwin" ? "Mac" : os.type();
  const upTime = os.uptime();
  const freeMem = os.freemem();
  const totalMem = os.totalmem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.floor((usedMem / totalMem) * 100) / 100;
  const cpuModel = cpus[0].model;
  const cpuSpeed = cpus[0].speed;
  const numCores = cpus.length;
  const cpuLoad = await getCpuLoad();
  return {
    macA: macA,
    osType,
    upTime,
    freeMem,
    totalMem,
    usedMem,
    memUsage,
    cpuModel,
    cpuSpeed,
    numCores,
    cpuLoad,
  };
}


async function getCpuLoad() {
  const start = cpuAvg();
  await setTimeout(100);
  const end = cpuAvg();
  const idleDifference = end.idleMs - start.idleMs;
  const totalDifference = end.totalMs - start.totalMs;
  //   console.log(idleDifference, totalDifference);
  const percentageCpu =
    100 - Math.floor((100 * idleDifference) / totalDifference);
  return percentageCpu;
}

function cpuAvg() {
  const cpus = os.cpus();

  //Get ms in each mode, BUT this ms number is since reboot
  // So we need it now, and get it again in 100ms and compare
  let idleMs = 0;
  let totalMs = 0;
  cpus.forEach((core) => {
    for (let type in core.times) {
      //  console.log(type,core.times[type]);
      totalMs += core.times[type];
    }
    idleMs += core.times.idle;
  });
  return {
    totalMs: totalMs / cpus.length,
    idleMs: idleMs / cpus.length,
  };
}
