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

  constructor() {
    super();

    //setInterval(() => this.setAttribute("src", Math.random().toString()), 1000);
    return this;
  }

  connectedCallback() {
    this.innerHTML = `<img src="https://i2-prod.belfastlive.co.uk/incoming/article13722455.ece/ALTERNATES/s615/1PNG.png" />
    <div class="box"></div>`;
    this.boxWrapper = document.querySelector('.box');


    const observableDisconnect = from(
      new Promise(resolve => {
        this.resolveDisconnect = resolve;
      })
    );

    socketio
      .boxPayloadObservable(Number(this.getAttribute("cctvid")))
      .pipe(takeUntil(observableDisconnect))
      .subscribe(this.renderBoxes.bind(this));

    console.log("Custom square element added to page.");
  }

  disconnectedCallback() {
    this.resolveDisconnect();
    console.log("Custom square element removed from page.");
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
const {boxWrapper}  =this;
    boxWrapper.querySelectorAll(".mix-blend").forEach(x => x.remove());

    payload.forEach(({ id, style }) => {
      const box = document.createElement("div");
      box.classList.add("mix-blend");
      Object.assign(box, style);
      box.innerHTML = `<span class="mix-blend">${id}</span>`;
      boxWrapper.appendChild(box);
    });

    `<div class="box" style={style}>
      <span style={{ background: style.borderColor || defaultBorderColor }}>
        
      </span>
    </div>`;
  }
}

customElements.define("cctv-bbox", CCTVBBox);
