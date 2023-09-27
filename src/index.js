import React, { useEffect, useState } from "react";
import ReactDOM, { render } from "react-dom";
import { Stage, Layer } from "react-konva";
import uuid from "uuid/v1";
import ImageFromUrl from "./ImageFromUrl";
import Annotation from "./Annotation";
import "./styles.css";

// console.log(newset)
// for(let i = 0; i < initialStorage.length;i++)
// {
//   for(let j = 0; j < initialStorage[i].length; j++)
//   {
//     console.log(initialStorage[i][j])
//   }
//   console.log("======================================")
// }

function App() {
  // const [un,setUn] = new Set();
  // setUn(initialStorage)
  const [annotations, setAnnotations] = useState([]);
  const [newAnnotation, setNewAnnotation] = useState([]);
  const [selectedId, selectAnnotation] = useState(null);
  const [canvasMeasures, setCanvasMeasures] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [initialStorage, setInitialStorage] = useState([]);
  const arrayy = [];
  const [groupstr, setGroupstr] = useState(new Set());
  const newset = new Set("");

  useEffect(() => {
    if (window.localStorage.getItem("myN") === null) {
      window.localStorage.setItem("myN", 0);
    } else {
      for (let l = 0; l < window.localStorage.length; l++) {
        const arr = [];
        for (let k = 0; k < window.localStorage.length; k++) {
          const key = window.localStorage.key(k);
          if (key.startsWith(`${"hist" + l}:`)) {
            const item = window.localStorage.getItem(key);
            if (item.length !== 0) {
              arr.push(item);
              newset.add("hist" + l);
              setGroupstr(newset);
            }
          } else {
            continue;
          }
        }
        if (arr.length !== 0) {
          arrayy.push(arr);
          setInitialStorage(arrayy);
        }
      }
    }
  }, []);

  const handleMouseDown = (event) => {
    if (selectedId === null && newAnnotation.length === 0) {
      const { x, y } = event.target.getStage().getPointerPosition();
      const id = uuid();
      setNewAnnotation([{ x, y, width: 0, height: 0, id }]);
    }
  };

  const handleMouseMove = (event) => {
    if (selectedId === null && newAnnotation.length === 1) {
      const sx = newAnnotation[0].x;
      const sy = newAnnotation[0].y;
      const { x, y } = event.target.getStage().getPointerPosition();
      const id = uuid();
      setNewAnnotation([
        {
          x: sx,
          y: sy,
          width: x - sx,
          height: y - sy,
          id,
        },
      ]);
    }
  };

  const handleMouseUp = () => {
    if (selectedId === null && newAnnotation.length === 1) {
      annotations.push(...newAnnotation);
      setAnnotations(annotations);
      setNewAnnotation([]);
    }
  };

  const handleMouseEnter = (event) => {
    event.target.getStage().container().style.cursor = "crosshair";
  };

  const handleKeyDown = async (event) => {
    if (event.keyCode === 8 || event.keyCode === 46) {
      if (selectedId !== null) {
        const newAnnotations = annotations.filter(
          (annotation) => annotation.id !== selectedId
        );
        await setAnnotations(newAnnotations);
      }
    }
    // window.localStorage.setItem('annotation-data', JSON.stringify(annotations));
  };

  const setItemG = (group, key, value) => {
    window.localStorage.setItem(`${group}:${key}`, JSON.stringify(value));
  };

  const handleSave = () => {
    let i = parseInt(localStorage.getItem("myN"));
    for (let x = 0; x < annotations.length; x++) {
      setItemG("hist" + i, "item" + x, annotations[x]);
    }
    i++;
    window.localStorage.setItem("myN", i);
    window.location.reload();
  };

  const showAnnotations = (e) => {
    const arrrr = [];
    for (let l = 0; l < window.localStorage.length; l++) {
      const arr = [];
      for (let k = 0; k < window.localStorage.length; k++) {
        const key = window.localStorage.key(k);
        if (key.startsWith(`${e}:`)) {
          const item = window.localStorage.getItem(key);
          if (item.length !== 0) {
            arr.push(item);
            // setGroupstr(newset)
          }
        } else {
          continue;
        }
      }
      if (arr.length !== 0) {
        arrrr.push(arr);
        setInitialStorage(arrrr);
      }
    }
  };

  const annotationsToDraw = [...annotations, ...newAnnotation];
  return (
    <div>
      {/* <button onClick={handleSave}>Save</button> */}
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-primary" onClick={handleSave}>
          Save
        </button>
      </div>
      <div className="flex row">
        <div tabIndex={1} onKeyDown={handleKeyDown} className="col">
          <Stage
            width={canvasMeasures.width}
            height={canvasMeasures.height}
            onMouseEnter={handleMouseEnter}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              <ImageFromUrl
                setCanvasMeasures={setCanvasMeasures}
                imageUrl="https://cdn.dribbble.com/users/2150390/screenshots/8064018/media/117406b607c400e7030deb6dfa60caa6.jpg"
                onMouseDown={() => {
                  // deselect when clicked on empty area
                  selectAnnotation(null);
                }}
              />
              {annotationsToDraw.map((annotation, i) => {
                return (
                  <Annotation
                    key={i}
                    shapeProps={annotation}
                    isSelected={annotation.id === selectedId}
                    onSelect={() => {
                      selectAnnotation(annotation.id);
                    }}
                    onChange={(newAttrs) => {
                      const rects = annotations.slice();
                      rects[i] = newAttrs;
                      setAnnotations(rects);
                    }}
                  />
                );
              })}
              {initialStorage.map((annotation, i) =>
                annotation.map((val, ind) => (
                  <Annotation
                    key={ind}
                    shapeProps={JSON.parse(val)}
                    isSelected={JSON.parse(val).id === selectedId}
                    onSelect={() => {
                      selectAnnotation(JSON.parse(val).id);
                    }}
                    onChange={(newAttrs) => {
                      const rects = JSON.parse(val).slice();
                      rects[i] = newAttrs;
                      setAnnotations(rects);
                    }}
                  />
                ))
              )}
            </Layer>
          </Stage>
        </div>
        <div className="col mt-2">
          {/* {annotations.map((val, index) => (
            <div className="border border-width-fit" key={index}>
              <p>ID : {val.id}</p>
              <p>x : {val.x}</p>
              <p>y : {val.y}</p>
              <p>width : {val.width}</p>
              <p>height : {val.height}</p>
            </div>
          ))} */}
          {/* {console.log(initialStorage,annotations,newAnnotation)} */}
          {initialStorage.length > 0 ? (
            Array.from(groupstr).map((val, oindex) => (
              <div key={oindex} className="border">
                {/* {val.length > 0 ? val.map((data, index) => (
                <div key={index} className="border">
                  <p className="text-black">ID : {JSON.parse(data).id}</p>
                  <p>x : {JSON.parse(data).x}</p>
                  <p>y : {JSON.parse(data).y}</p>
                  <p>Width : {JSON.parse(data).width}</p>
                  <p>Height : {JSON.parse(data).height}</p>
                </div>
              )) : <div></div>} */}
                <div class="d-grid gap-2">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    onClick={() => {
                      showAnnotations(val);
                    }}
                  >
                    ID : {val}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
