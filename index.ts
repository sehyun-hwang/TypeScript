// Import stylesheets
import "./bbox.css";
import { AppState, BoxPayload } from "./bbox";

import { Observable, fromEvent, from, OperatorFunction } from "rxjs";
import { map, filter, takeUntil } from "rxjs/operators";

// @ts-ignore
import { io } from "socket.io-client";
import { VendorLonghandProperties } from "csstype";

interface AppProps {
  src?: string;
}

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

class CCTVBBox extends HTMLElement {
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
    const video = document.createElement("video");
    video.autoplay = true;
    video.src = src;
    this.querySelector("img").replaceWith(video);
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
      Object.assign(bbox, { style });
      bbox.innerHTML = `<span>${id}</span>`;
      bbox.querySelector("span").style.background =
        style.borderColor || this.defaultBorderColor;
      this.appendChild(bbox);
    });
  }
}

customElements.define("cctv-bbox", CCTVBBox);
