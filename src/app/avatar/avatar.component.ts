import {Component, OnInit} from '@angular/core';
import * as THREE from 'super-three';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit{

  //aframe
  aframe = (window as any).AFRAME

  waiting: boolean;

  // Create a FileLoader instance
  loader: THREE.FileLoader = new THREE.FileLoader();

  audio = new Audio(`assets/male/welcome.ogg`);

  lipsync: any;

  meshNodeHead: any;
  meshNodeTeeth: any;

  isSmoothMorphTarget: boolean = false;

  audioJSON: string = 'assets/male/welcome.json'

  corresponding = {
    A: "viseme_PP",
    B: "viseme_kk",
    C: "viseme_I",
    D: "viseme_AA",
    E: "viseme_O",
    F: "viseme_U",
    G: "viseme_FF",
    H: "viseme_TH",
    X: "viseme_PP",
  }

  constructor() {
  }

  ngOnInit(): void {
    const myComponent = this;

    this.loader.load(this.audioJSON,
      (data: string) => {
        // Parse the loaded JSON data
        this.lipsync = JSON.parse(data);
      })

    if (!this.aframe.components['my-hook']) {
      this.aframe.registerComponent('my-hook', {
        schema: {},

        update: function () {

        },
        tick: function (time, deltaTime) {
          if (myComponent.audio.currentTime === 0) return;

          const currentAudioTime = myComponent.audio.currentTime;

          Object.entries(myComponent.corresponding).forEach(([key, value]) => {
            if (myComponent.isSmoothMorphTarget) {
              myComponent.meshNodeHead.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[value]] = THREE.MathUtils.lerp(myComponent.meshNodeHead.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[value]], 0, 0.5);
              myComponent.meshNodeTeeth.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[value]] = THREE.MathUtils.lerp(myComponent.meshNodeTeeth.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[value]], 0, 0.5);
            } else {
              myComponent.meshNodeHead.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[value]] = 0;
              myComponent.meshNodeTeeth.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[value]] = 0;
            }
          });


          for (let i = 0; i < myComponent.lipsync.mouthCues.length; i++) {
            const mouthCue = myComponent.lipsync.mouthCues[i];
            if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
              if (myComponent.isSmoothMorphTarget) {
                myComponent.meshNodeHead.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[myComponent.corresponding[mouthCue.value]]] = THREE.MathUtils.lerp(myComponent.meshNodeHead.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[myComponent.corresponding[mouthCue.value]]], 1, 0.5);
                myComponent.meshNodeTeeth.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[myComponent.corresponding[mouthCue.value]]] = THREE.MathUtils.lerp(myComponent.meshNodeTeeth.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[myComponent.corresponding[mouthCue.value]]], 1, 0.5);
              } else {
                myComponent.meshNodeHead.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[myComponent.corresponding[mouthCue.value]]] = 1;
                myComponent.meshNodeTeeth.morphTargetInfluences[myComponent.meshNodeHead.morphTargetDictionary[myComponent.corresponding[mouthCue.value]]] = 1;
              }
              break;
            }
          }

        }

      })
    }
  }

  playMyEvent(event: any) {
    if (this.waiting) {
      return;
    }
    this.waiting = true;
    setTimeout(() => {
      this.waiting = false;

      //player mesh
      const player: THREE = document.querySelector('#playerID');
      //sound
      const soundComponent = player.components.sound;

      let playerMesh = player.getObject3D("mesh");

      const meshNameHead = 'Wolf3D_Head'
      const meshNameTeeth = 'Wolf3D_Teeth'

      this.meshNodeHead = playerMesh.getObjectByName(meshNameHead);
      this.meshNodeTeeth = playerMesh.getObjectByName(meshNameTeeth);

      this.audio.play();

      // meshNodeHead.morphTargetInfluences[meshNodeHead.morphTargetDictionary["viseme_O"]] = 1;
      // meshNodeTeeth.morphTargetInfluences[meshNodeHead.morphTargetDictionary["viseme_O"]] = 1;

    }, 100);
  }

}

//https://github.com/DanielSWolf/rhubarb-lip-sync?tab=readme-ov-file
