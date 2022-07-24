import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import {
  Scene,
  Mesh,
  PerspectiveCamera,
  Object3D,
  AmbientLight,
  SpotLight,
  PointLight,
  MeshBasicMaterial,
} from "three";
import ExpoTHREE, { Renderer, TextureLoader, THREE } from "expo-three";
import { GLView } from "expo-gl";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { Asset } from "expo-asset";

global.THREE = global.THREE || THREE;

const App = () => {
  let isLoading = true;
  let model = new Object3D();
  let textureIndex = 1;
  let changeTexture = false;
  let rotation = {
    x: 0,
    y: 0,
    z: 0,
  };
  //variable to store touch coordinates
  let touchData = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    startTime: 0,
    endTime: 0,
    deltaX: 0,
    deltaY: 0,
  };

  // function to load the model
  const onContextCreate = async (gl) => {
    /// Set up the scene
    const renderer = new Renderer({ gl });
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );

    // Set the camera position
    camera.position.z = 5;

    const ambientLight = new AmbientLight(0x101010);
    scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 2, 1500, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);

    const spotLight = new SpotLight(0xffffff, 0.5);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);

    // add light from bottom of screen
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, -1, 0);
    scene.add(light);

    // create a loading animation
    const loading = new Object3D();
    // load font
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        // create a text geometry
        const textGeometry = new TextGeometry("Loading...", {
          font: font,
          size: 0.25,
          height: 0.1,
        });
        // create a text mesh
        const textMesh = new Mesh(
          textGeometry,
          new MeshBasicMaterial({ color: 0x262626 })
        );
        // set the text mesh position
        textMesh.position.set(0, 0, 0);
        // add the text mesh to the loading object
        loading.add(textMesh);
      }
    );
    loading.position.set(-0.6, 0.5, 0);
    scene.add(loading);
    isLoading = true;

    /// Load textures
    const texture1 = await ExpoTHREE.loadAsync(
      require("./assets/Phone/iPhone_DefaultMaterial_Diffuse.png")
    );
    const texture2 = await ExpoTHREE.loadAsync(
      require("./assets/Phone/iPhone_DefaultMaterial_DiffuseBlue.png")
    );
    const texture3 = await ExpoTHREE.loadAsync(
      require("./assets/Phone/iPhone_DefaultMaterial_DiffuseRed.png")
    );
    const texture4 = await ExpoTHREE.loadAsync(
      require("./assets/Phone/iPhone_DefaultMaterial_DiffuseGold.png")
    );

    // set default texture
    let texture = texture1;
    textureIndex = 1;

    // Load material and model
    const obj = await Asset.fromModule(
      require("./assets/Phone/iphone_11_pro_max.obj")
    );
    const mtl = await Asset.fromModule(
      require("./assets/Phone/iphone_11_pro_max.mtl")
    );
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtl.uri, function (materials) {
      // configure the materials
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(obj.uri, function (object) {
        // configure the model
        model = object;
        model.position.set(0, 0.5, 0);
        model.scale.set(0.03, 0.03, 0.03);

        //apply texture to model
        model.traverse((child) => {
          if (child instanceof Mesh) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });

        // add the model to the scene
        scene.add(model);
        scene.remove(loading);
        isLoading = false;
      });
    });

    //render the scene
    const render = () => {
      requestAnimationFrame(render);
      // show loading animation while model is loading
      if (isLoading) {
        loading.rotation.x += 0.1;
      }
      // check if the model is loaded
      if (model) {
        ///  check if texture needs to be changed
        if (changeTexture) {
          // set texture as per the index
          switch (textureIndex) {
            case 1:
              texture = texture1;
              break;
            case 2:
              texture = texture2;
              break;
            case 3:
              texture = texture3;
              break;
            case 4:
              texture = texture4;
              break;
            default:
              texture = texture1;
              break;
          }
          // apply texture to model
          model.traverse((child) => {
            if (child instanceof Mesh) {
              child.material.map = texture;
            }
          });
          changeTexture = false;
        }
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={{ flex: 1, marginTop: StatusBar.currentHeight }}>
      {/* Title: Iphone 11 Pro Max */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 25,
          color: "white",
          marginTop: 10,
          marginLeft: 10,
          marginRight: 10,
          textAlign: "center",
          backgroundColor: "#262626",
          textShadowColor: "black",
          borderRadius: 10,
        }}
      >
        Iphone 11 Pro Max
      </Text>
      {/* Color Options */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 15,
          }}
        >
          Choose color:{" "}
        </Text>
        {/* Black Button*/}
        <TouchableOpacity
          style={{
            backgroundColor: "#262626",
            width: 50,
            height: 50,
            borderRadius: 100,
            margin: 10,
          }}
          onPress={() => {
            textureIndex = 1;
            changeTexture = true;
          }}
        ></TouchableOpacity>
        {/* Blue Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#9BB5CE",
            width: 50,
            height: 50,
            borderRadius: 100,
            margin: 10,
          }}
          onPress={() => {
            textureIndex = 2;
            changeTexture = true;
          }}
        ></TouchableOpacity>
        {/* Red Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#BA0C2E",
            width: 50,
            height: 50,
            borderRadius: 100,
            margin: 10,
          }}
          onPress={() => {
            textureIndex = 3;
            changeTexture = true;
          }}
        ></TouchableOpacity>
        {/* Gold Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#F9E5C9",
            width: 50,
            height: 50,
            borderRadius: 100,
            margin: 10,
          }}
          onPress={() => {
            textureIndex = 4;
            changeTexture = true;
          }}
        ></TouchableOpacity>
      </View>

      {/* Render the scene */}
      <GLView
        style={{
          flex: 1,
        }}
        onContextCreate={onContextCreate}
        // Rotate model on touch
        onTouchStart={(event) => {
          touchData.startX = event.nativeEvent.locationX;
          touchData.startY = event.nativeEvent.locationY;
          touchData.startTime = event.nativeEvent.timestamp;
        }}
        onTouchMove={(event) => {
          touchData.endX = event.nativeEvent.locationX;
          touchData.endY = event.nativeEvent.locationY;
          touchData.endTime = event.nativeEvent.timestamp;
          touchData.deltaX = touchData.endX - touchData.startX;
          touchData.deltaY = touchData.endY - touchData.startY;
          rotation.x += touchData.deltaX * 0.01;
          rotation.y += touchData.deltaY * 0.01;
          model.rotation.set(rotation.y, rotation.x, rotation.z);
          touchData.startX = touchData.endX;
          touchData.startY = touchData.endY;
        }}
      />
    </View>
  );
};

export default App;
