
import "./bbox.css";
import { AppState, BoxPayload } from "./bbox";
import app from "./app";
import { Observable, fromEvent, from, OperatorFunction } from "rxjs";
import { map, filter, takeUntil } from "rxjs/operators";

// @ts-ignore
import { io } from "socket.io-client";
import { VendorLonghandProperties } from "csstype";

interface AppProps {
  src?: string;
}


const obj = JSON.parse(`[{"id":"person-136","style":{"border":"rgb(123.0, 65.0, 115.0)","left":"49.421065317537135%","top":"12.15227913793749%","right":"53.73568740483663%","bottom":"27.2016329282594%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-174","style":{"border":"rgb(214.0, 97.0, 107.0)","left":"47.6505086523863%","top":"61.782458836587736%","right":"54.66330998871557%","bottom":"83.6918225258257%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-186","style":{"border":"rgb(181.0, 207.0, 107.0)","left":"15.12828317103545%","top":"14.90870520608762%","right":"19.22806132919826%","bottom":"31.011429435578208%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-187","style":{"border":"rgb(206.0, 219.0, 156.0)","left":"86.07113925716965%","top":"2.168811781185519%","right":"89.4228686816703%","bottom":"17.86958631173296%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-188","style":{"border":"rgb(140.0, 109.0, 49.0)","left":"-9.165105599151214%","top":"48.563342587772205%","right":"-4.781808892311059%","bottom":"66.49947049109795%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-189","style":{"border":"rgb(189.0, 158.0, 57.0)","left":"80.30757898277426%","top":"-0.000011339418355404973%","right":"84.33658879038113%","bottom":"10.608847184416234%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-191","style":{"border":"rgb(231.0, 203.0, 148.0)","left":"27.782121165384776%","top":"56.95054328617483%","right":"35.12929507018072%","bottom":"79.79639426108827%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-192","style":{"border":"rgb(132.0, 60.0, 57.0)","left":"83.26007722586168%","top":"80.78826840049054%","right":"88.82942955925887%","bottom":"99.96239737794792%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-193","style":{"border":"rgb(173.0, 73.0, 74.0)","left":"53.75896385659368%","top":"12.547259326253993%","right":"56.99678978308448%","bottom":"27.477412139043206%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-198","style":{"border":"rgb(206.0, 109.0, 189.0)","left":"52.25957899682907%","top":"0.8878938436065298%","right":"56.70520360027812%","bottom":"13.645033729312308%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-199","style":{"border":"rgb(222.0, 158.0, 214.0)","left":"55.17564871115525%","top":"5.083471616204449%","right":"56.87295702158415%","bottom":"12.04601182762289%"},"comment":"Start editing to see some magic happen :)"},{"id":"person-201","style":{"border":"rgb(82.0, 84.0, 163.0)","left":"91.33146969768863%","top":"38.76685634512937%","right":"96.4130559671212%","bottom":"59.68750000000001%"},"comment":"Start editing to see some magic happen :)"}]`)

const socketio = (() => {
  const socket = io("wss://proxy.hwangsehyun.com/webrtc-onvif", {
    transports: ["websocket"]
  });
  const boxEvent = fromEvent(socket, "box");

  const boxPayloadMap = map(([id, payload]: [number, BoxPayload]) =>
    payload.boxs.map(({ id, box, style = {} }) => {
      Object.entries(box).forEach(
        ([key, value]) => (style[key] = 100 * value + "%")
      );

      return {
        id,
        style,
        comment: "Start editing to see some magic happen :)"
      };
    })
  );

  const boxPayloadObservable = (_id: number) =>
    boxEvent.pipe(
      filter(([id, payload]: [number, BoxPayload]) => _id === id),
      boxPayloadMap
    );
  return { boxPayloadObservable };
})();

fetch("https://www.hwangsehyun.com/webrtc-onvif/webrtc/config.json")
  .then(res => res.json())
  .then(console.log);

export class CCTVBBox extends HTMLElement {
  boxStates: AppState[];
  video: HTMLVideoElement;
  boxWrapper: HTMLDivElement;
  boxes: HTMLDivElement[];
  resolveDisconnect: VoidFunction;
  defaultBorderColor: string;
  constructor() {
    super();

    //setInterval(() => this.setAttribute("src", Math.random().toString()), 1000);
    return this;
  }

  connectedCallback() {
    this.defaultBorderColor = getComputedStyle(document.body).getPropertyValue(
      "--default-box-border"
    );
    this.classList.add("mix-blend");
    this.innerHTML = `<img src="https://i2-prod.belfastlive.co.uk/incoming/article13722455.ece/ALTERNATES/s615/1PNG.png" />`;

    const observableDisconnect = from(
      new Promise(resolve => {
        this.resolveDisconnect = resolve;
      })
    );

    socketio
      .boxPayloadObservable(Number(this.getAttribute("cctvid")))
      .pipe(takeUntil(observableDisconnect))
      .subscribe(this.renderBoxes.bind(this));
    setTimeout(() => this.setAttribute("src", "foo"), 0);
    //this.renderBoxes(obj);
    console.log(this, "Connected");
  }

  disconnectedCallback() {
    this.resolveDisconnect();
    console.log(this, "Disconnected");
  }

  static get observedAttributes() {
    return ["src"];
  }

  srcCallback(src) {
    console.log("srcCallback", src);
    const video = document.createElement("video");
    video.autoplay = true;
    //video.src = src;
    this.querySelector("img").replaceWith(video);
    app(video);
  }

  attributeChangedCallback(attribute, prev, cur) {
    if (!cur) return;

    this.srcCallback(cur);
  }

  renderBoxes(payload) {
    console.log(payload);
    this.querySelectorAll("div").forEach(x => x.remove());

    payload.forEach(({ id, style }) => {
      const bbox = document.createElement("div");
      Object.assign(bbox.style, style);
      bbox.innerHTML = `<span>${id}</span>`;
      bbox.querySelector("span").style.background =
        style.borderColor || this.defaultBorderColor;
      this.appendChild(bbox);
    });
  }
}

customElements.define("cctv-bbox", CCTVBBox);
