const WEBRTC = "https://apigateway-http.beyondwork.co.kr/gpu/stream";
const RTC_JSON = "https://www.hwangsehyun.com/webrtc-onvif/webrtc/config.json";
const CONFIG = {
  iceServers: [
    {
      urls: []
    }
  ],
  streams: []
};

const DEBUG = false;
const CAMERA_CNT = 4;

function app(videoElem, suuid) {
  const stream = new MediaStream();
  let sendChannel;

  const pc = new RTCPeerConnection(CONFIG);
  pc.onnegotiationneeded = handleNegotiationNeededEvent.bind(undefined, pc);
  pc.ontrack = function(event) {
    stream.addTrack(event.track);
    console.log(videoElem, stream);
    videoElem.srcObject = stream;
  };
  pc.oniceconnectionstatechange = console.warn;

  pc.addEventListener("iceconnectionstatechange", event => {
    pc.oniceconnectionstatechange = function(evt) {
      if (pc.iceConnectionState === "failed") {
        if (pc.restartIce) {
          pc.restartIce();
        } else {
          pc.createOffer({ iceRestart: true })
            .then(pc.setLocalDescription)
            .then(sendOfferToServer);
        }
      }
    };
  });

  async function handleNegotiationNeededEvent() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    getRemoteSdp();
  }

  const getCodecInfo = () =>
    fetch([WEBRTC, "codec", suuid].join("/"))
      .then(res => res.text())
      .then(data => {
        try {
          JSON.parse(data).forEach(({ Type }) =>
            pc.addTransceiver(Type, {
              direction: "sendrecv"
            })
          );
        } catch (error) {
          console.warn(error);
        }

        sendChannel = pc.createDataChannel("foo");
        sendChannel.onclose = () => console.log("sendChannel has closed");
        sendChannel.onopen = () => {
          console.log("sendChannel has opened");
          sendChannel.send("ping");
          setInterval(() => sendChannel.send("ping"), 1000);
        };
        sendChannel.onmessage = e =>
          console.log(`Message from DataChannel '${sendChannel.label}'`);
      });
  getCodecInfo();

  const getRemoteSdp = () =>
    fetch(WEBRTC + "/receiver/" + suuid, {
      method: "POST",
      body: new URLSearchParams({
        suuid: suuid,
        data: btoa(pc.localDescription.sdp)
      })
    })
      .then(res => res.text())

      .then(data => {
        try {
          pc.setRemoteDescription(
            new RTCSessionDescription({
              type: "answer",
              sdp: atob(data)
            })
          );
        } catch (e) {
          console.warn(e);
        }
      });
}

const getVideoStreams = () =>
  fetch(RTC_JSON)
    .then(async res => (res.ok ? res.json() : Promise.reject(await res.text())))
    .then(resData => {
      let data = resData;
      const iceServers = data.server.ice_servers;
      const streams = Object.keys(data.streams);
      console.log(streams);
      iceServers.forEach(url => {
        CONFIG.iceServers[0].urls.push(url);
      });
      streams.forEach(stream => {
        CONFIG.streams.push(stream);
      });
    })
    .then(console.error);

export default element => getVideoStreams().then(() => app(element, "test"));
